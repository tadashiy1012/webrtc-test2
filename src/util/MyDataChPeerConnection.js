import * as uuidv1 from 'uuid/v1';
import {iceServers} from './iceServers';

const MAX_BYTES = 64 * 1024;

export default class MyDataChPeerConnection {
    constructor(webSocket, {
        onNegotiationneeded = (ev) => console.log(ev),
        onIcecandidate = (ev) => console.log(ev)
    }, env = null) {
        this.id = uuidv1();
        this.ws = webSocket;
        this.conn = new RTCPeerConnection({ iceServers });
        this.conn.onnegotiationneeded = onNegotiationneeded;
        this.conn.onicecandidate = onIcecandidate;
        this.conn.ondatachannel = (ev) => {
            console.log(ev);
            if (this.dc === null) {
                this.dc = ev.channel;
            }
        };
        this.dc = null;
        this.env = env;
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
            if (count >= 60) { 
                clearInterval(id);
                console.warn('time out');
            }
            count += 1;
        }, 1000);
    }
    send(msg) {
        const json = {id: this.id, type: 'plane', message: msg};
        this.dc.send(JSON.stringify(json));
    }
    sendBuf(buf) {
        console.log('send buf');
        console.log(buf);
        const size = buf.length;
        let chunk = [];
        let index = 0;
        do {
            chunk.push(buf.slice(index, MAX_BYTES));
            index += MAX_BYTES;
        } while (size > index);
        chunk.push(buf.slice(index));
        const end = new Uint8Array(1);
        end.set([0]);
        chunk.push(end.buffer);
        console.log(chunk);
        chunk.forEach(e => this.dc.send(e));
    }
}
