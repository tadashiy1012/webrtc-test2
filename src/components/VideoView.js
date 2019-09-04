/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {makeFakeStream} from '../util';
import {jsx, css} from '@emotion/core';

@inject('produce', 'root')
@observer
export default class VideoView extends React.Component {
    constructor(props) {
        super(props);
        this.callCamera = false;
        this.videoRef = React.createRef();
    }
    onFake() {
        this.props.produce.setCurrentStream(null);
        const newStream = makeFakeStream(this.props.root.audioCtx);
        this.props.produce.setCurrentStream(newStream);
        navigator.mediaDevices.getUserMedia({
            video: true, 
            audio: this.props.produce.micMode
        }).then((stream) => {
            this.videoRef.current.srcObject = stream;
        }).catch((err) => console.error(err));
    }
    onCamera() {
        (async () => {
            this.props.produce.setCurrentStream(null);
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user'
                }, audio: this.props.produce.micMode
            });
            this.props.produce.setCurrentStream(newStream);
            this.props.produce.setPCsTrack();
            this.videoRef.current.srcObject = newStream;
        })();
    }
    onCamera2() {
        (async () => {
            this.props.produce.setCurrentStream(null);
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment'
                }, audio: this.props.produce.micMode
            });
            this.props.produce.setCurrentStream(newStream);
            this.props.produce.setPCsTrack();
            this.videoRef.current.srcObject = newStream;
        })();
    }
    onDisplay() {
        (async () => {
            this.props.produce.setCurrentStream(null);
            const newStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });
            this.props.produce.setCurrentStream(newStream);
            this.props.produce.setPCsTrack();
            this.videoRef.current.srcObject = newStream;
        })();
    }
    onVideoModeChange(value) {
        this.props.produce.setVideoMode(value);
        if (value === 'camera') {
            this.onCamera();
        } else if (value === 'camera2') {
            this.onCamera2();
        } else if (value === 'display') {
            this.onDisplay();
        }
        if (this.props.produce.pcs.length > 0) {
            this.callCamera = true;
        }
    }
    onMicModeChange() {
        this.props.produce.setMicMode(!this.props.produce.micMode);
        const videoMode = this.props.produce.videoMode;
        if (videoMode === 'camera') {
            this.onCamera();
        } else if (videoMode === 'camera2') {
            this.onCamera2();
        } else if (videoMode === 'display') {
            this.onDisplay();
        }
        if (this.props.produce.pcs.length > 0) {
            this.callCamera = true;
        }
    }
    render() {
        if (this.props.produce.pcs.length > 0 && !this.callCamera) {
            const videoMode = this.props.produce.videoMode;
            if (videoMode === 'camera') {
                this.onCamera();
            } else if (videoMode === 'camera2') {
                this.onCamera2();
            } else if (videoMode === 'display') {
                this.onDisplay();
            }
        }
        return <Fragment>
            <div>
                <video autoPlay muted ref={this.videoRef} css={{
                    width:'100%', height:'300px', backgroundColor:'black'
                }}></video>
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
        this.onFake();
    }
}