import MyPeerConnection from "./MyPeerConnection";

export default function makeProducePC(ws, destination) { 
    const _pc = new MyPeerConnection(ws, {
        onIcecandidate: (ev) => {
            console.log(ev);
            if (ev.candidate === null) {
                if (_pc.conn.remoteDescription !== null) {
                    console.log('send sdp');
                    const to = 'consume@890';
                    const type = 'produce';
                    const sdp = _pc.conn.localDescription.sdp;
                    const json = { to, type, destination, sdp };
                    _pc.ws.send(JSON.stringify(json));
                }
            }
        }
    });
    return _pc;
}