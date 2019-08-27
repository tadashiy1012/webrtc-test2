import {observable, action} from 'mobx';
import {WebAssemblyRecorder} from 'recordrtc'
import * as RecordRTC from 'recordrtc/RecordRTC';
import {makeWebSocket, makeConsumePC} from '../util';
import * as uuid from 'uuid/v1';

export default class ConsumeStore {

    @observable id = uuid();
    @observable ws = null;
    @observable pc = null;
    @observable dcPc = null;
    @observable target = null;
    @observable stream = null;
    @observable recorder = null;
    @observable rec = false;

    constructor() {
        this.ws = makeWebSocket({
            auth: 'consume@890', password: '0749637637'
        }, {});
    }

    @action
    setWsOnMessageHandler(handler) {
        this.ws.onmessage = handler;
    }

    @action
    setPC(pc) {
        this.pc = pc;
    }
    
    @action
    setRecievedAnswer(sdp) {
        const recievedAnswer = new RTCSessionDescription({
            type: 'answer', sdp
        });
        (async () => {
            if (this.pc.conn.remoteDescription !== null 
                    && this.pc.conn.remoteDescription !== recievedAnswer) {
                this.setPC(makeConsumePC(this.id, this.ws, true));
                await this.pc.setLocalDesc(await this.pc.createOffer());
            }
            await this.pc.setRemoteDesc(recievedAnswer);
        })();
    }

    @action
    setPcOnTrackHandler(handler) {
        this.pc.conn.ontrack = handler;
    }

    @action
    setTarget(tgt) {
        this.target = tgt;
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
    toggleRec() {
        this.rec = !this.rec;
    }

}