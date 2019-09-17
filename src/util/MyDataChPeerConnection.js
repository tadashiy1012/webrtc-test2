import * as uuidv1 from 'uuid/v1';
import {iceServers} from './iceServers';

const MAX_BYTES = 64 * 1024;

export default class MyDataChPeerConnection {
    constructor(webSocket, {
        onNegotiationneeded = (ev) => console.log(ev),
        onIcecandidate = (ev) => console.log(ev),
        onDcMessageHandler = (ev) => console.log(ev)
    }) {
        this.id = uuidv1();
        this.ws = webSocket;
        this.conn = new RTCPeerConnection({ iceServers });
        this.conn.onnegotiationneeded = onNegotiationneeded;
        this.conn.onicecandidate = onIcecandidate;
        this.conn.ondatachannel = (ev) => {
            console.log(ev);
            if (this.dc === null) {
                this.dc = ev.channel;
                this.dc.onmessage = onDcMessageHandler;
                this.isDcOpen = true;
            }
        };
        this.dc = null;
        this.isDcOpen = false;
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
        this.dc.onopen = (ev) => {
            console.log(ev);
            this.isDcOpen = true;
        };
        this.dc.onclose = (ev) => {
            console.log(ev);
            this.isDcOpen = false;
        };
        this.dc.onerror = (err) => console.error(err);
    }
    send(msg) {
        const json = {id: this.id, type: 'plane', message: msg};
        if (this.dc && this.isDcOpen) {
            this.dc.send(JSON.stringify(json));
        } else {
            console.warn('data channel is not open!');
        }
    }
    sendBuf(buf) {
        console.log('send buf');
        console.log(buf);
        let chunk = [];
        let fi = 0;
        while (fi * MAX_BYTES < buf.byteLength) {
            chunk.push(buf.slice(fi * MAX_BYTES, (fi + 1) * MAX_BYTES));
            fi += 1;
        }
        const end = new Uint8Array(1);
        end.set([0]);
        chunk.push(end.buffer);
        console.log(chunk);
        if (this.dc && this.isDcOpen) {
            chunk.forEach(e => this.dc.send(e));
        } else {
            console.warn('data channel is not open!');
        }
    }
}
