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
                    facingMode: 'user'
                }, audio: this.props.consume.micMode
            });
            this.props.consume.setStreamSelf(newStream);
            this.props.consume.addTrackToPc();
            this.selfVideoRef.current.srcObject = newStream;
        })();
    }
    render() {
        return <Fragment>
            <video ref={this.selfVideoRef} autoPlay muted webkit-playsinline='true' playsInline 
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
        </Fragment>
    }
    componentDidMount() {
        this.onFake();
        this.onSelfCamera();
    }
}