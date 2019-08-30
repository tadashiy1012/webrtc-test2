import * as uuidv1 from 'uuid/v1';
import {iceServers} from './iceServers';
import string2TypedArray from './string2TypedArray';

export default class MyDataChPeerConnection {
    constructor(webSocket, {
        onNegotiationneeded = (ev) => console.log(ev),
        onIcecandidate = (ev) => console.log(ev)
    }) {
        this.id = uuidv1();
        this.ws = webSocket;
        this.conn = new RTCPeerConnection({ iceServers });
        this.conn.onnegotiationneeded = onNegotiationneeded;
        this.conn.onicecandidate = onIcecandidate;
        this.conn.ondatachannel = (ev) => {
            if (this.dc === null) {
                this.dc = ev.channel;
            }
        };
        this.dc = null;
    }
    async createOffer() {
        return await this.conn.createOffer();
    }
    async createAnswer() {
        return await this.conn.createAnswer();
    }
    async setLocalDesc(desc) {
        await this.conn.setLocalDescription(desc);
    }
    async setRemoteDesc(desc) {
        await this.conn.setRemoteDescription(desc);
    }
    overriteId(id) {
        this.id = id;
    }
    createDataCh() {
        this.dc = this.conn.createDataChannel('chat');
        this.dc.onmessage = (ev) => console.log(ev);
        this.dc.onopen = (ev) => console.log(ev);
        this.dc.onclose = (ev) => console.log(ev);
        this.dc.onerror = (err) => console.error(err);
    }
    setOnMessageHandler(handler = (ev) => console.log(ev)) {
        const self = this;
        let count = 0;
        const id = setInterval(function() {
            if (self.dc !== null) {
                self.dc.onmessage = handler;
                clearInterval(id);
            }
            if (count >= 30) { 
                clearInterval(id);
                console.warn('time out');
            }
            count += 1;
        }, 1000);
    }
    send(msg) {
        const json = {id: this.id, message: msg};
        this.dc.send(JSON.stringify(json));
    }
    sendBlob(blob) {
        const fr = new FileReader();
        fr.onload = (ev) => {
            console.log(ev);
            const file = new Uint16Array(fr.result);
            const id = string2TypedArray(this.id);
            const type = string2TypedArray(blob.type);
            const header = new Uint16Array(100);
            header.set(id);
            header.set(type, id.length);
            let tary = new Uint16Array(header.length + file.length);
            tary.set(header);
            tary.set(file, header.length);
            this.dc.send(tary);
        };
        fr.readAsArrayBuffer(blob);
    }
}
