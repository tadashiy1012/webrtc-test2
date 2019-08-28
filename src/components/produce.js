import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {makeProducePC, makeProduceDataChPC} from '../util';

const Consumer = (props) => (
    <li><span onClick={props.handleClick}>{props.uuid}</span></li>
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
            return <Consumer key={idx} uuid={e.uuid} handleClick={() => {
                this.onConsumerClick(e.uuid, e.sdp);
            }} />
        });
        return <ul>{childs}</ul>
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
            <div>
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
        const children = this.props.produce.says.map((e, idx) => {
            return <li key={idx}><span>{e.id.substring(0, 5)}</span> : <span>{e.say}</span></li>
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

@inject('produce')
@observer
class File extends React.Component {
    constructor(props) {
        super(props)
        this.fileRef = React.createRef();
    }
    handleSendClick() {
        console.log(this.fileRef.current);
        console.log(this.fileRef.current.files);
        this.props.produce.dcPCs.forEach((dcpc) => {
            console.log(dcpc);
            dcpc.sendBlob(this.fileRef.current.files[0]);
        });
    }
    render() {
        return <Fragment>
            <div>
                <input type='file' ref={this.fileRef} accept='.jpg,.png,.pdf'/>
                <button onClick={() => {this.handleSendClick()}}>send</button>
            </div>
        </Fragment>
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
        return <Fragment>
            <VideoView />
            <ConsumerList />
            <Chat />
            <File />
        </Fragment>
    }
}
