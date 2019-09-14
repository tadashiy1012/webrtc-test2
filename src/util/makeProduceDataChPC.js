import MyDataChPeerConnection from "./MyDataChPeerConnection";

export default function makeProduceDataChPC(id, ws, destination, handler) {
    const _pc = new MyDataChPeerConnection(ws, {
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