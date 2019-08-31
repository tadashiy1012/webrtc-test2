import {observable, action, computed} from 'mobx';
import {makeWebSocket} from '../util';
import * as uuid from 'uuid/v1';

const SimpleState = Base => class extends Base {

    @observable id = uuid();
    @observable ws = null;
    @observable videoMode = 'camera';
    @observable micMode = true;
    @observable currentStream = null;
    @observable setting = false;
    @observable key = 'default';

    @action
    regenerateId() {
        this.id = uuid();
    }

    @action
    createWebSocket() {
        this.ws = makeWebSocket({
            auth: 'default@890', password: '19861012'
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
    setVideoMode(videoMode) {
        this.videoMode = videoMode;
    }

    @action
    setMicMode(mode) {
        this.micMode = mode;
    }

    @action
    setCurrentStream(stream) {
        if (this.currentStream !== null) {
            this.currentStream.getTracks().forEach(track => {
                track.enabled = !track.enabled;
                track.stop();
                this.currentStream.removeTrack(track);
            });
        }
        this.currentStream = stream;
    }

    @action
    toggleSetting() {
        this.setting = !this.setting;
    }

    @action
    setKey(key) {
        this.key = key;
    }

}

export {
    SimpleState
};