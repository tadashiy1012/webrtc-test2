import {observable, action, computed} from 'mobx';
import {makeWebSocket, getDoc} from '../util';
import * as uuid from 'uuid/v1';

export default class ProduceStore {

    @observable id = uuid();
    @observable ws = null;
    @observable pcs = [];
    @observable dcPCs = [];
    @observable consumers = [];
    @observable videoMode = 'camera';
    @observable micMode = false;
    @observable currentStream = null;
    @observable tgts = [];
    @observable says = [];
    @observable objects = [];
    @observable setting = false;
    @observable key = 'default';

    constructor() {
        this.ws = makeWebSocket({
            auth: 'default@890', password: '19861012'
        }, {});
    }

    @action
    regenerateId() {
        this.id = uuid();
    }

    @action
    setWsOnMessageHandler(handler) {
        this.ws.onmessage = handler;
    }
    
    @action 
    addPeerConnection(pc, destination) {
        const pcObj = {pc, destination, status: false};
        this.pcs.push(pcObj);
    }
    
    @action
    findPeerConnection(destination) {
        return this.pcs.find(e => e.destination === destination);
    }

    @action
    pcIndexOf(tgt) {
        return this.pcs.indexOf(tgt);
    }

    @action
    removePeerConnection(idx) {
        this.pcs.splice(idx, 1);
    }

    @action
    setPeerConnectionStatus(idx, status) {
        console.log(idx, status);
        this.pcs[idx].status = status;
        this.pcs = Object.assign([], this.pcs);
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
        this.pcs.map(e => e.pc).forEach(pc => {
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
    removeConsumer(idx) {
        this.consumers.splice(idx, 1);
    }

    @action
    clearConsumers() {
        this.consumers = [];
    }

    @action
    findConsumer(uuid) {
        return this.consumers.find(e => e.uuid === uuid);
    }

    @action
    consumerIndexOf(tgt) {
        return this.consumers.indexOf(tgt);
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
    addTgt(tgt, destination) {
        this.tgts.push({tgt, destination});
    }

    @action
    clearTgts() {
        this.tgts = [];
    }

    @action
    addSay(id, say) {
        const time = Date.now();
        this.says.push({id, time, say});
    }

    @action
    clearSays() {
        this.says = [];
    }

    @action
    addObj(id, obj) {
        const time = Date.now();
        const tgt = {id, time, obj, pdf: null};
        this.objects.push(tgt);
    }

    @action
    clearObjects() {
        this.objects = [];
    }

    @action
    readPdf(object) {
        const target = this.objects.find(e => e.time === object.time);
        getDoc(object.obj).then((result) => {
            console.log(result);
            target.pdf = result;
        });
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