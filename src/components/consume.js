import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
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
            console.log('pdf not null');
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
        } else {
            console.log('pdf null');
        }
        return <canvas ref={this.pdfRef}></canvas>
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
                        <br />
                        <img src={URL.createObjectURL(e.obj)} />
                        <br />
                        <a href={URL.createObjectURL(e.obj)} download='file'>download</a>
                    </li>
                } else if (e.obj.type === 'application/pdf') {
                    return <li key={idx}>
                        <span>{e.id.substring(0, 5)}</span> : 
                        <br />
                        <PDFView tgt={e} />
                        <br />
                        <a href={URL.createObjectURL(e.obj)} download='file'>download</a>
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
            <div>
                <input type='text' ref={this.textRef} />
                <button onClick={() => {this.handleSendClick()}}>send</button>
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
    render() {
        const icon = this.props.consume.rec ? '🔴':'⚫';
        return <Fragment>
            <div>
                <video ref={(video) => {
                    if (video) {
                        this.props.consume.setTarget(video);
                    }
                }} autoPlay controls width='400' height='300'/>
            </div>
            <div>
                <button onClick={() => {this.onClickRec()}}>
                    <span>{icon}</span>
                    rec
                </button>
            </div>
            <Chat />
        </Fragment>
    }
}
