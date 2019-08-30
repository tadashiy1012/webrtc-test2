import {observable, action} from 'mobx';
import {WebAssemblyRecorder} from 'recordrtc'
import * as RecordRTC from 'recordrtc/RecordRTC';
import {makeWebSocket, makeConsumePC, makeConsumeDataChPC, tArray2String, getDoc} from '../util';
import * as uuid from 'uuid/v1';

export default class ConsumeStore {

    @observable id = uuid();
    @observable ws = null;
    @observable pc = null;
    @observable dcPc = null;
    @observable target = null;
    @observable stream = null;
    @observable streamSelf = null;
    @observable micMode = false;
    @observable recorder = null;
    @observable rec = false;
    @observable says = [];
    @observable objects = [];

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
    addTrackToPc() {
        const senders = this.pc.conn.getSenders();
        this.streamSelf.getTracks().forEach(track => {
            if (senders.length > 0) {
                senders[0].replaceTrack(track);
            } else {
                this.pc.addTrack(track, this.streamSelf);
            }
        });
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
    setDcPC(dcPc) {
        this.dcPc = dcPc;
    }

    @action
    setDcOnMessage() {
        this.dcPc.setOnMessageHandler((ev) => {
            console.log(ev);
            if (typeof ev.data === 'string') {
                const json = JSON.parse(ev.data);
                this.addSay(json.id, json.message);
            } else {
                if (ev.data instanceof ArrayBuffer) {
                    const tary = new Uint16Array(ev.data);
                    const header = tary.slice(0, 100);
                    const id = header.slice(0, 36);
                    const type = header.slice(36);
                    const file = tary.slice(100);
                    const typeStr = tArray2String(type.slice(0, type.indexOf(0)));
                    console.log(typeStr);
                    const blob = new Blob([file], {type: typeStr});
                    console.log(blob);
                    this.addObj(tArray2String(id), blob);
                }
            }
        });
    }

    @action
    setDcRecievedAnswer(sdp) {
        const recievedAnswer = new RTCSessionDescription({
            type: 'answer', sdp
        });
        console.log(recievedAnswer);
        (async () => {
            if (this.dcPc.conn.remoteDescription !== null) {
                if (this.dcPc.conn.remoteDescription !== recievedAnswer) {
                    this.setDcPC(makeConsumeDataChPC(this.id, this.ws, true));
                    this.setDcOnMessage();
                    await this.dcPc.setLocalDesc(await this.dcPc.createOffer());
                    await this.dcPc.setRemoteDesc(recievedAnswer);
                }
            } else {
                await this.dcPc.setRemoteDesc(recievedAnswer);
            }
        })();
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
    addSay(id, say) {
        const time = Date.now();
        this.says.push({id, time, say});
    }

    @action
    addObj(id, obj) {
        const time = Date.now();
        const tgt = {id, time, obj, pdf: null};
        this.objects.push(tgt);
    }

    @action
    readPdf(object) {
        const target = this.objects.find(e => e.time === object.time);
        getDoc(object.obj).then((result) => {
            console.log(result);
            target.pdf = result;
        });
    }


}