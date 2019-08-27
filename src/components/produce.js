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
class VideoModeRadio extends React.Component {
    onVideoModeChange() {
        this.props.produce.toggleVideoMode();
    }
    render() {
        return <div>
            <label>
                <input type='radio' name='videoMode' value='camera' checked={
                    this.props.produce.videoMode === 'camera'
                } onChange={() => this.onVideoModeChange()} />
                <span>camera</span>
            </label>
            <label>
                <input type='radio' name='videoMode' value='display' checked={
                    this.props.produce.videoMode === 'display'
                } onChange={() => this.onVideoModeChange()} />
                <span>display</span>
            </label>
        </div>
    }
}

@inject('produce')
@observer
class VideoView extends React.Component {
    onCamera(video) {
        (async () => {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: true, audio: false
            });
            this.props.produce.setCurrentStream(newStream);
            this.props.produce.setPCsTrack();
            video.srcObject = newStream;
        })();
    }
    onDisplay(video) {
        (async () => {
            const newStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });
            this.props.produce.setCurrentStream(newStream);
            this.props.produce.setPCsTrack();
            video.srcObject = newStream;
        })();
    }
    render() {
        return <div>
            <video width="400" height="300" autoPlay ref={(video) => {
                if (video !== null) {
                    if (this.props.produce.videoMode === 'camera') {
                        this.onCamera(video);
                    } else if (this.props.produce.videoMode === 'display') {
                        this.onDisplay(video);
                    }
                }
            }}></video>
        </div>
    }
}

@inject('produce')
@observer
class Chat extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillUnmount() {
        this.props.produce.clearDataChPeerConnections();
    }
    render() {
        const child = this.props.produce.says.map(e => {
            <li>{e}</li>
        });
        return <div>
            <input type='text' onChange={(e) => {console.log(e.target.value)}} />
            <button>send</button>
            <div>
                <ul>{child}</ul>
            </div>
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
                const dcpc = makeProduceDataChPC(
                    this.props.produce.ws, json.uuid);
                this.props.produce.addDataChPeerConnection(dcpc);
                const offer = new RTCSessionDescription({
                    type: 'offer', sdp: json.sdp
                });
                (async () => {
                    await dcpc.setRemoteDesc(offer);
                    await dcpc.setLocalDesc(await pc.createAnswer());
                })();
            }
        });
    }
    componentWillUnmount() {
        this.props.produce.setCurrentStream(null);
        this.props.produce.setWsOnMessageHandler(() => {});
        this.props.produce.clearPeerConnections();
        this.props.produce.clearConsumers();
    }
    render() {
        return <Fragment>
            <VideoView />
            <VideoModeRadio />
            <ConsumerList />
            <Chat />
        </Fragment>
    }
}
