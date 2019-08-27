import {observable, action} from 'mobx';
import {makeWebSocket} from '../util';
import * as uuid from 'uuid/v1';

export default class ProduceStore {

    @observable id = uuid();
    @observable ws = null;
    @observable pcs = [];
    @observable dcPCs = [];
    @observable consumers = [];
    @observable videoMode = 'camera';
    @observable currentStream = null;
    @observable says = [];

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
    addDataChPeerConnection(dcpc) {
        this.dcPCs.push(dcpc);
    }

    @action
    clearDataChPeerConnections() {
        this.dcPCs = [];
    }

    @action
    setPCsTrack() {
        this.pcs.forEach(pc => {
            const senders = pc.conn.getSenders();
            this.currentStream.getTracks().forEach(track => {
                if (senders.length > 0) {
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
                track.enabled = !track.enabled;
                track.stop();
                this.currentStream.removeTrack(track);
            });
        }
        this.currentStream = stream;
    }

    @action
    addSay(say) {
        this.says.push(say);
    }

    @action
    clearSays() {
        this.says = [];
    }

}