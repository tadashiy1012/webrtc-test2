import {observable, action} from 'mobx';
import {makeConsumePC, makeConsumeDataChPC, tArray2String} from '../util';

const PeerConnState = Base => class extends Base {
    
    @observable pc = null;
    @observable dcPc = null;

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

}

export {
    PeerConnState
};