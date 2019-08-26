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
            this.props.consume.target.srcObject = ev.streams[0];
        });
    }
    componentWillUnmount() {
        this.props.consume.setWsOnMessageHandler(() => {});
        this.props.consume.setPC(null);
    }
    render() {
        return <Fragment>
            <div>
                <video ref={(video) => {
                    if (video) {
                        this.props.consume.setTarget(video);
                    }
                }} autoPlay controls width='400' height='300'/>
            </div>
        </Fragment>
    }
}
