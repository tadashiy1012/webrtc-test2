import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {makeConsumePC, makeConsumeDataChPC} from '../util';

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
        const children = this.props.consume.says.map((e, idx) => {
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
        this.props.consume.dcPc.createDataCh((ev) => {
            console.log(ev);
            const json = JSON.parse(ev.data);
            console.log(json);
            this.props.consume.addSay(json.id, json.message);
        });
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
