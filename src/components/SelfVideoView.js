/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {jsx, css} from '@emotion/core';
import {makeFakeStream} from '../util';

@inject('consume', 'root')
@observer
export default class SelfVideoView extends React.Component {
    constructor(props) {
        super(props);
        this.selfVideoRef = React.createRef();
    }
    onFake() {
        this.props.consume.setStreamSelf(null);
        const newStream = makeFakeStream(this.props.root.audioCtx);
        this.props.consume.setStreamSelf(newStream);
        this.props.consume.addTrackToPc();
    }
    onSelfCamera() {
        (async () => {
            this.props.consume.setStreamSelf(null);
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: 320,
                    height: 240
                }, audio: this.props.consume.micMode
            });
            this.props.consume.setStreamSelf(newStream);
            this.props.consume.addTrackToPc();
            this.selfVideoRef.current.srcObject = newStream;
        })();
    }
    render() {
        const mq = [360, 576, 800].map(
            bp => `@media (min-width: ${bp}px)`
        );
        return <Fragment>
            <video ref={this.selfVideoRef} 
                autoPlay muted webkit-playsinline='true' playsInline 
                css={{[mq[0]]: {width:'82px', height:'62px', position:'absolute', right:'11%', top:'4px'},
                     [mq[2]]: {width:'77%', height:'44%', position:'static', display:'block', margin:'0px auto'}, backgroundColor:'black'}} />
            <div css={{[mq[0]]: {display:'none'}, [mq[2]]: {display:'grid'}, gridTemplateColumns:'repeat(100px)', justifyContent:'center'}}>
                <label>
                    <input type='checkbox' name='micMode' checked={this.props.consume.micMode} onChange={() => {
                        this.props.consume.setMicMode(!this.props.consume.micMode);
                        this.onSelfCamera();
                    }} />
                    <span>mic</span>
                </label>
            </div>
        </Fragment>
    }
    componentDidMount() {
        this.onFake();
        this.props.consume.setTargetSelf(this.selfVideoRef.current);
        this.onSelfCamera();
    }
}