import {observable, action} from 'mobx';
import {makeWebSocket} from '../util';

export default class ProduceStore {

    @observable ws = null;
    @observable pcs = [];
    @observable consumers = [];
    @observable videoMode = 'camera';
    @observable currentStream = null;

    constructor() {
        this.ws = makeWebSocket({
            auth: 'default@890', password: '19861012'
        }, {});
    }

    @action
    setWsOnMessageHandler(handler) {
        this.ws.onmessage = handler;
    }
    @action 
    addPeerConnection(pc) {
        this.pcs.push(pc);
    }
    @action
    clearPeerConnections() {
        this.pcs = [];
    }
    @action
    setPCsTrack() {
        this.pcs.forEach(pc => {
            const senders = pc.conn.getSenders();
            this.currentStream.getTracks().forEach(track => {
                if (senders > 0) {
                    senders[0].replaceTrack(track);
                } else {
                    pc.addTrack(track, this.currentStream);
                }
            });
        });
    }
    @action
    addConsumers(consumer) {
        this.consumers.push(consumer);
    }
    @action
    clearConsumers() {
        this.consumers = [];
    }
    @action
    toggleVideoMode() {
        if (this.videoMode === 'camera') {
            this.videoMode = 'display';
        } else {
            this.videoMode = 'camera';
        }
    }
    @action
    setCurrentStream(stream) {
        if (this.currentStream !== null) {
            this.currentStream.getTracks().forEach(track => {
                track.enabled = false;
                track.stop();
                this.currentStream.removeTrack(track);
            });
        }
        this.currentStream = stream;
    }

}