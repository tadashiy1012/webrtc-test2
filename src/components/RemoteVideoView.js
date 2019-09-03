/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {jsx, css} from '@emotion/core';
import {} from '../util';

@inject('consume')
@observer
export default class RemoteVideoView extends React.Component {
    constructor(props) {
        super(props);
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
        const mq = [360, 576, 800].map(
            bp => `@media (min-width: ${bp}px)`
        );
        const icon = this.props.consume.rec ? '🔴':'⚫';
        return <Fragment>
            <video ref={(video) => {
                if (video) {
                    this.props.consume.setTarget(video);
                }
            }} autoPlay webkit-playsinline='true' playsInline controls 
                className='mx-auto d-block' css={{width:'96%', minHeight:'220px', backgroundColor:'black'}} />
            <div css={{margin:'8px 0px', display:'grid', [mq[0]]:{gridTemplateColumns:'repeat(2, 100px)'},
                    [mq[2]]:{ gridTemplateColumns:'100px'}, justifyContent:'space-around'}}>
                <button onClick={() => {this.onClickRec()}} className='btn btn-outline-primary'>
                    <span>{icon}</span>
                    rec
                </button>
                <div className='form-check' css={{[mq[0]]: {display:'inline'}, [mq[2]]: {display:'none'}}}>
                    <input type='checkbox' id='micMode' name='micMode' checked={this.props.consume.micMode} onChange={async () => {
                            this.props.consume.setMicMode(!this.props.consume.micMode);
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
                            this.props.consume.targetSelf.srcObject = newStream;
                        }} className='form-check-input' />
                    <label htmlFor='micMode' className='form-check-label'>mic</label>
                </div>
            </div>
        </Fragment>
    }
}