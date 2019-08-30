/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {jsx, css} from '@emotion/core';
import {makeConsumePC, makeConsumeDataChPC} from '../util';

@inject('consume')
@observer
class PDFView extends React.Component {
    constructor(props) {
        super(props);
        this.pdfRef = React.createRef();
        this.props.consume.readPdf(this.props.tgt);
    }
    render() {
        const tgt = this.props.consume.objects.find(e => e.time === this.props.tgt.time);
        if (tgt.pdf !== null) {
            tgt.pdf.getPage(1).then((page) => {
                const scale = 0.7;
                const view = page.getViewport({scale});
                const canvas = this.pdfRef.current;
                const ctx = canvas.getContext('2d');
                canvas.height = view.height;
                canvas.width = view.width;
                page.render({
                    canvasContext: ctx,
                    viewport: view
                });
            });
        }
        return <canvas ref={this.pdfRef} className='rounded mx-auto d-block'></canvas>
    }
}

@inject('consume')
@observer
class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.textRef = React.createRef();
    }
    handleSendClick() {
        this.props.consume.addSay('[me]', this.textRef.current.value);
        this.props.consume.dcPc.send(this.textRef.current.value);
    }
    render() {
        const ary = [...this.props.consume.says, ...this.props.consume.objects].sort((a, b) => a.time - b.time);
        const children = ary.map((e, idx) => {
            if (e.say) {
                return <li key={idx}><span>{e.id.substring(0, 5)}</span> : <span>{e.say}</span></li>
            } else {
                console.log(e);
                if (e.obj.type === 'image/jpeg') {
                    return <li key={idx}>
                        <span>{e.id.substring(0, 5)}</span> : 
                        <div className='card' css={{padding:'22px'}}>
                            <img src={URL.createObjectURL(e.obj)} className='rounded mx-auto d-block' />
                            <a href={URL.createObjectURL(e.obj)} download='file'>download</a>
                        </div>
                    </li>
                } else if (e.obj.type === 'application/pdf') {
                    return <li key={idx}>
                        <span>{e.id.substring(0, 5)}</span> : 
                        <div className='card' css={{padding:'22px'}}>
                            <PDFView tgt={e} />
                            <a href={URL.createObjectURL(e.obj)} download='file'>download</a>
                        </div>
                    </li>
                } else {
                    return <li key={idx}>
                        <span>{e.id.substring(0, 5)}</span> : 
                        <a href={URL.createObjectURL(e.obj)} download='file'>download</a>
                    </li>
                }
            }
        }).reverse();
        return <Fragment>
            <div className='row'>
                <div className='col-md-9'>
                    <input type='text' ref={this.textRef} placeholder='message' className='form-control' />
                </div>
                <div className='col-md-3'>
                    <button onClick={() => {this.handleSendClick()}} className='btn btn-primary btn-block'>send message</button>
                </div>
            </div>
            <ul>
                {children}
            </ul>
        </Fragment>
    }
}

@inject('root', 'consume')
@observer
export default class Consume extends React.Component {
    constructor(props) {
        super(props);
        this.props.root.setMode('consume');
        this.props.consume.setWsOnMessageHandler((ev) => {
            console.log(ev);
            const json = JSON.parse(ev.data);
            console.log(json);
            if (json.type === 'produce') {
                if (this.props.consume.pc !== null 
                        && this.props.consume.id === json.destination) {
                    console.log('message to me (pc)');
                    this.props.consume.setRecievedAnswer(json.sdp);
                }
            } else if (json.type === 'produce_dc') {
                console.log(json.destination, this.props.consume.id, json.destination === this.props.consume.id);
                if (this.props.consume.dcPc !== null
                        && this.props.consume.id === json.destination) {
                    console.log('message to me (dcPc)');
                    this.props.consume.setDcRecievedAnswer(json.sdp);
                }
            }
        });
        this.props.consume.setPC(makeConsumePC(
            this.props.consume.id, this.props.consume.ws));
        this.props.consume.setPcOnTrackHandler((ev) => {
            console.log(ev);
            this.props.consume.setRecorder(ev.streams[0]);
            this.props.consume.target.srcObject = ev.streams[0];
        });
        this.props.consume.setDcPC(makeConsumeDataChPC(
            this.props.consume.id, this.props.consume.ws
        ));
        this.props.consume.dcPc.createDataCh();
        this.props.consume.setDcOnMessage();
        this.selfVideoRef = React.createRef();
    }
    componentWillUnmount() {
        console.log('consume component unmount');
        this.props.consume.setWsOnMessageHandler(() => {});
        this.props.consume.setPC(null);
    }
    onClickRec() {
        if (this.props.consume.rec) {
            this.props.consume.recorder.stopRecording(() => {
                const blob = this.props.consume.recorder.getBlob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'video.webm';
                a.click();
            });
        } else {
            this.props.consume.recorder.startRecording();
        }
        this.props.consume.toggleRec();
    }
    onSelfCamera() {
        console.log(this.selfVideoRef);
        (async () => {
            this.props.consume.setStreamSelf(null);
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user'
                }, audio: this.props.consume.micMode
            });
            this.props.consume.setStreamSelf(newStream);
            this.props.consume.addTrackToPc();
            this.selfVideoRef.current.srcObject = newStream;
        })();
    }
    render() {
        const icon = this.props.consume.rec ? '🔴':'⚫';
        return <Fragment>
            <div css={{marginTop:'12px'}}>
                <div className='row no-gutters'>
                    <div className='col-md-9 align-self-center'>
                        <video ref={(video) => {
                            if (video) {
                                this.props.consume.setTarget(video);
                            }
                        }} autoPlay webkit-playsinline playsinline controls className='mx-auto d-block' css={{minWidth:'400px', width:'90%', minHeight:'300px'}} />
                        <div css={{margin:'8px 0px'}}>
                            <button onClick={() => {this.onClickRec()}} className='mx-auto d-block btn btn-outline-primary'>
                                <span>{icon}</span>
                                rec
                            </button>
                        </div>
                    </div>
                    <div className='col-md-3 align-self-center'>
                        <video ref={this.selfVideoRef} autoPlay webkit-playsinline playsinline 
                            className='mx-auto d-block' css={{width:'90%', height: '200px', backgroundColor:'black'}} />
                        <div css={{display:'grid', gridTemplateColumns:'repeat(100px)', justifyContent:'center'}}>
                            <label>
                                <input type='checkbox' name='micMode' checked={this.props.consume.micMode} onChange={() => {
                                    this.props.consume.setMicMode(!this.props.consume.micMode);
                                    this.onSelfCamera();
                                }} />
                                <span>mic</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <Chat />
        </Fragment>
    }
    componentDidMount() {
        this.onSelfCamera();
    }
}
