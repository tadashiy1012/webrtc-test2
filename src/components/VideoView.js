/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {} from '../util';
import {jsx, css} from '@emotion/core';

@inject('produce')
@observer
export default class VideoView extends React.Component {
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
                }, audio: this.props.produce.micMode
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
                }, audio: this.props.produce.micMode
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
    onMicModeChange() {
        this.props.produce.setMicMode(!this.props.produce.micMode);
        const videoMode = this.props.produce.videoMode;
        if (videoMode === 'camera') {
            this.onCamera(this.videoRef.current);
        } else if (videoMode === 'camera2') {
            this.onCamera2(this.videoRef.current);
        } else if (videoMode === 'display') {
            this.onDisplay(this.videoRef.current);
        }
    }
    render() {
        return <Fragment>
            <div>
                <video width="100%" height="300" autoPlay muted ref={this.videoRef}></video>
            </div>
            <div css={{display:'grid', gridTemplateColumns:'repeat(auto-fit, 90px)', justifyContent:'center'}}>
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
                <label>
                    <input type='checkbox' name='mic' 
                        checked={this.props.produce.micMode} 
                        onChange={() => this.onMicModeChange()} />
                    <span>mic</span>
                </label>
            </div>
        </Fragment> 
    }
    componentDidMount() {
        this.onCamera(this.videoRef.current);
    }
}