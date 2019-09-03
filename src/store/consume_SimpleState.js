import {observable, action} from 'mobx';
import {WebAssemblyRecorder} from 'recordrtc'
import * as RecordRTC from 'recordrtc/RecordRTC';
import * as uuid from 'uuid/v1';
import {makeWebSocket} from '../util';

const SimpleState = Base => class extends Base {

    @observable id = uuid();
    @observable ws = null;
    @observable target = null;
    @observable targetSelf = null;
    @observable stream = null;
    @observable streamSelf = null;
    @observable micMode = false;
    @observable recorder = null;
    @observable rec = false;
    @observable key = null;

    @action
    regenerateId() {
        this.id = uuid();
    }

    @action
    createWebSocket() {
        this.ws = makeWebSocket({
            auth: 'consume@890', password: '0749637637'
        }, {});
    }

    @action
    setWebSocket(ws) {
        this.ws = ws;
    }

    @action
    unsetWebSocket() {
        this.ws = null;
    }

    @action
    setWsOnMessageHandler(handler) {
        this.ws.onmessage = handler;
    }
    
    @action
    setTarget(tgt) {
        this.target = tgt;
    }

    @action
    setTargetSelf(tgt) {
        this.targetSelf = tgt;
    }

    @action
    setStream(stream) {
        this.stream = stream;
    }
    
    @action
    setRecorder(stream) {
        this.recorder = new RecordRTC(stream, {
            type: 'video',
            mimeType: 'video/webm',
            recorderType: WebAssemblyRecorder,
            timeSlice: 1000,
            checkForInactiveTracks: true,
            videoBitsPerSecond: 512000,
            frameInterval: 90,
        });
    }

    @action
    unsetRecorder() {
        this.recorder = null;
    }

    @action
    setStreamSelf(stream) {
        if (this.streamSelf !== null) {
            this.streamSelf.getTracks().forEach(track => {
                track.enabled = !track.enabled;
                track.stop();
                this.streamSelf.removeTrack(track);
            });
        }
        this.streamSelf = stream;
    }

    @action
    setMicMode(mode) {
        this.micMode = mode;
    }

    @action
    toggleRec() {
        this.rec = !this.rec;
    }

    @action
    setKey(key) {
        this.key = key;
    }

}

export {
    SimpleState
};