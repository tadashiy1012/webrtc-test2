import {observable, action} from 'mobx';
import {makeWebSocket, makeConsumePC} from '../util';

export default class ConsumeStore {

    @observable ws = null;
    @observable pc = null;
    @observable target = null;
    @observable stream = null;

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
                this.setPC(makeConsumePC(this.ws, true));
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

}