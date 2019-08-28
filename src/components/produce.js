/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {makeProducePC, makeProduceDataChPC} from '../util';
import {jsx, css} from '@emotion/core';

const Consumer = (props) => (
    <li><a href='#' onClick={props.handleClick}>{props.uuid}</a></li>
);

@inject('produce')
@observer
class ConsumerList extends React.Component {
    onConsumerClick(dest, sdp) {
        const pc = makeProducePC(
            this.props.produce.ws, dest
        );
        this.props.produce.addPeerConnection(pc);
        this.props.produce.setPCsTrack();
        const offer = new RTCSessionDescription({
            type: 'offer', sdp
        });
        (async () => {
            await pc.setRemoteDesc(offer);
            await pc.setLocalDesc(await pc.createAnswer());
        })();
    }
    render() {
        const childs = this.props.produce.consumers.map((e, idx) => {
            return <Consumer key={idx} uuid={e.uuid} handleClick={(evt) => {
                evt.preventDefault();
                this.onConsumerClick(e.uuid, e.sdp);
            }} />
        });
        return <div className='card'>
            <div className='card-body'>
                <h3>consumer list</h3>
                <ul>{childs}</ul>
            </div>
        </div>
    }
}

@inject('produce')
@observer
class VideoView extends React.Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }
    onCamera(video) {
        (async () => {
            this.props.produce.setCurrentStream(null);
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user'
                }, audio: false
            });
            this.props.produce.setCurrentStream(newStream);
            this.props.produce.setPCsTrack();
            video.srcObject = newStream;
        })();
    }
    onCamera2(video) {
        (async () => {
            this.props.produce.setCurrentStream(null);
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment'
                }, audio: false
            });
            this.props.produce.setCurrentStream(newStream);
            this.props.produce.setPCsTrack();
            video.srcObject = newStream;
        })();
    }
    onDisplay(video) {
        (async () => {
            this.props.produce.setCurrentStream(null);
            const newStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });
            this.props.produce.setCurrentStream(newStream);
            this.props.produce.setPCsTrack();
            video.srcObject = newStream;
        })();
    }
    onVideoModeChange(value) {
        this.props.produce.setVideoMode(value);
        if (value === 'camera') {
            this.onCamera(this.videoRef.current);
        } else if (value === 'camera2') {
            this.onCamera2(this.videoRef.current);
        } else if (value === 'display') {
            this.onDisplay(this.videoRef.current);
        }
    }
    render() {
        return <Fragment>
            <div>
                <video width="100%" height="300" autoPlay ref={this.videoRef}></video>
            </div>
            <div css={{display:'grid', gridTemplateColumns:'repeat(auto-fit, 100px)', justifyContent:'center'}}>
                <label>
                    <input type='radio' name='videoMode' value='camera' checked={
                        this.props.produce.videoMode === 'camera'
                    } onChange={(ev) => this.onVideoModeChange(ev.target.value)} />
                    <span>camera</span>
                </label>
                <label>
                    <input type='radio' name='videoMode' value='camera2' checked={
                        this.props.produce.videoMode === 'camera2'
                    } onChange={(ev) => this.onVideoModeChange(ev.target.value)} />
                    <span>camera2</span>
                </label>
                <label>
                    <input type='radio' name='videoMode' value='display' checked={
                        this.props.produce.videoMode === 'display'
                    } onChange={(ev) => this.onVideoModeChange(ev.target.value)} />
                    <span>display</span>
                </label>
            </div>
        </Fragment> 
    }
    componentDidMount() {
        this.onCamera(this.videoRef.current);
    }
}

@inject('produce')
@observer
class PDFView extends React.Component {
    constructor(props) {
        super(props);
        this.pdfRef = React.createRef();
        this.props.produce.readPdf(this.props.tgt);
    }
    render() {
        const tgt = this.props.produce.objects.find(e => e.time === this.props.tgt.time);
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

@inject('produce')
@observer
class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.textRef = React.createRef();
    }
    handleSendClick() {
        this.props.produce.addSay('[me]', this.textRef.current.value);
        this.props.produce.dcPCs.forEach((dcpc) => {
            console.log(dcpc);
            dcpc.send(this.textRef.current.value);
        });
    }
    render() {
        const ary = [...this.props.produce.says, ...this.props.produce.objects].sort((a, b) => a.time - b.time);
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
                <div className='col-md-6'>
                    <div css={{padding:'8px 0px'}}>
                        <input type='text' ref={this.textRef} placeholder='message' className='form-control' />
                    </div>
                    <button onClick={() => {this.handleSendClick()}} className='btn btn-primary btn-block'>send message</button>
                </div>
                <div className='col-md-6'>
                    <FileSelector />
                </div>
            </div>
            <br />
            <ul>
                {children}
            </ul>
        </Fragment>
    }
}

@inject('produce')
@observer
class FileSelector extends React.Component {
    constructor(props) {
        super(props)
        this.fileRef = React.createRef();
    }
    handleSendClick() {
        console.log(this.fileRef.current);
        console.log(this.fileRef.current.files);
        this.props.produce.addObj('[me]', this.fileRef.current.files[0]);
        this.props.produce.dcPCs.forEach((dcpc) => {
            console.log(dcpc);
            dcpc.sendBlob(this.fileRef.current.files[0]);
        });
    }
    render() {
        return <div>
            <div css={{padding:'12px 0px;'}}>
                <input type='file' ref={this.fileRef} accept='.jpg,.png,.pdf' className='form-control-file' />
            </div>
            <button onClick={() => {this.handleSendClick()}} className='btn btn-primary btn-block'>send file</button>
        </div>
    }
}

@inject('root', 'produce')
@observer
export default class Produce extends React.Component {
    constructor(props) {
        super(props);
        this.props.root.setMode('produce');
        this.props.produce.setWsOnMessageHandler((ev) => {
            console.log(ev);
            const json = JSON.parse(ev.data);
            console.log(json);
            if (json.type === 'consume') {
                this.props.produce.addConsumers(json);
            } else if (json.type === 'consume_dc') {
                console.log('dc');
                const dcpc = makeProduceDataChPC(
                    this.props.produce.id, this.props.produce.ws, json.uuid);
                dcpc.setOnMessageHandler((ev) => {
                    console.log(ev);
                    const json = JSON.parse(ev.data);
                    console.log(json);
                    this.props.produce.addSay(json.id, json.message);
                });
                this.props.produce.addDataChPeerConnection(dcpc);
                const offer = new RTCSessionDescription({
                    type: 'offer', sdp: json.sdp
                });
                (async () => {
                    await dcpc.setRemoteDesc(offer);
                    await dcpc.setLocalDesc(await dcpc.createAnswer());
                })();
            }
        });
    }
    componentWillUnmount() {
        console.log('produce component unmount');
        this.props.produce.setCurrentStream(null);
        this.props.produce.setWsOnMessageHandler(() => {});
        this.props.produce.clearPeerConnections();
        this.props.produce.clearDataChPeerConnections();
        this.props.produce.clearConsumers();
    }
    render() {
        return <div className='container'>
            <div className='row' css={{paddingTop:'8px'}}>
                <div className='col-md-7'>
                    <VideoView />
                </div>
                <div className='col-md-5'>
                    <ConsumerList />
                </div>
            </div>
            <Chat />
        </div>
    }
}
