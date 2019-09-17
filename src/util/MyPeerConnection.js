import * as uuidv1 from 'uuid/v1';
import {iceServers} from './iceServers';

export default class MyPeerConnection {
    constructor(webSocket, {
        onNegotiationneeded = (ev) => console.log(ev),
        onIcecandidate = (ev) => console.log(ev),
        onTrack = (ev) => console.log(ev)
    }) {
        this.id = uuidv1();
        this.ws = webSocket;
        this.conn = new RTCPeerConnection({ iceServers });
        this.conn.onnegotiationneeded = onNegotiationneeded;
        this.conn.onicecandidate = onIcecandidate;
        this.conn.ontrack = onTrack;
        this.conn.onicegatheringstatechange = (ev) => {
            console.log(ev);
            console.log(ev.target.iceGatheringState);
            const label = 'time1';
            if (ev.target.iceGatheringState === 'gathering') {
                console.time(label);
            } else if (ev.target.iceGatheringState === 'complete') {
                console.timeEnd(label);
            }
        };
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
    addTrack(track, stream) {
        return this.conn.addTrack(track, stream);
    }
}