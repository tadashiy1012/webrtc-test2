import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {makeConsumePC} from '../util';

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
            if (json.type !== 'produce') return;
            if (this.pc === null && this.pc.id !== json.destination) return;
            console.log('message to me');
            this.props.consume.setRecievedAnswer(json.sdp);
        });
        this.props.consume.setPC(makeConsumePC(this.props.consume.ws));
        this.props.consume.setPcOnTrackHandler((ev) => {
            console.log(ev);
            this.props.consume.setRecorder(ev.streams[0]);
            this.props.consume.target.srcObject = ev.streams[0];
        });
    }
    componentWillUnmount() {
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
        </Fragment>
    }
}
