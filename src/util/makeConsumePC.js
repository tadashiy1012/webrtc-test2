import MyPeerConnection from "./MyPeerConnection";

export default function makeConsumePC(id, ws, key, remake = false) {
    console.log('remake:' + remake);
    const _pc = new MyPeerConnection(ws, {
        onNegotiationneeded: (ev) => {
            console.log(ev);
            (async() => {
                if (!remake) {
                    console.log('create offer');
                    await _pc.setLocalDesc(await _pc.createOffer());
                }
            })();
        },
        onIcecandidate: (ev) => {
            console.log(ev);
            if (ev.candidate === null && !remake) {
                console.log('send sdp');
                const to = 'default@890';
                const type = 'consume';
                const sdp = _pc.conn.localDescription.sdp;
                const uuid = id;
                const json = { to, type, sdp, uuid, key };
                let count = 0;
                const iid = setInterval(function() {
                    if (_pc.ws.readyState === WebSocket.OPEN) {
                        _pc.ws.send(JSON.stringify(json));
                        clearInterval(iid);
                    }
                    if (count >= 10) {
                        console.log('time out');
                        clearInterval(iid);
                    }
                    count += 1
                }, 1000);
            }
        }
    });
    //_pc.conn.addTransceiver('video', {direction: 'recvonly'});
    //_pc.conn.addTransceiver('audio', {direction: 'recvonly'});
    return _pc;
}