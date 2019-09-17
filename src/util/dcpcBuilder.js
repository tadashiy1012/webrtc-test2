import MyDataChPeerConnection from './MyDataChPeerConnection';

export default class DcpcBuilder {
    constructor() {
        this.id = null;
        this.ws = null;
        this.destination = null;
        this.handler = (ev) => console.log(ev);
        this.pc = null;
    }
    setId(id) {
        this.id = id;
        return this;
    }
    setWs(ws) {
        this.ws = ws;
        return this;
    }
    setDest(destination) {
        this.destination = destination;
        return this;
    }
    setHandler(handler) {
        this.handler = handler;
        return this;
    }
    build() {
        const id = this.id;
        const destination = this.destination;
        const handler = this.handler;
        const _pc = new MyDataChPeerConnection(this.ws, {
            onIcecandidate: (ev) => {
                console.log(ev);
                if (ev.candidate === null) {
                    if (_pc.conn.remoteDescription !== null) {
                        console.log('send dc sdp');
                        const to = 'consume@890';
                        const type = 'produce_dc';
                        const sdp = _pc.conn.localDescription.sdp;
                        const json = {to, type, sdp, destination};
                        _pc.ws.send(JSON.stringify(json));
                    }
                }
            },
            onDcMessageHandler: (ev) => {
                console.log(ev);
                handler(ev);
            }
        });
        _pc.overriteId(id);
        return _pc;
    }
}