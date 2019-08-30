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
        const icon = this.props.consume.rec ? '🔴':'⚫';
        return <Fragment>
            <video ref={(video) => {
                if (video) {
                    this.props.consume.setTarget(video);
                }
            }} autoPlay webkit-playsinline='true' playsInline controls className='mx-auto d-block' css={{minWidth:'400px', width:'90%', minHeight:'300px'}} />
            <div css={{margin:'8px 0px'}}>
                <button onClick={() => {this.onClickRec()}} className='mx-auto d-block btn btn-outline-primary'>
                    <span>{icon}</span>
                    rec
                </button>
            </div>
        </Fragment>
    }
}