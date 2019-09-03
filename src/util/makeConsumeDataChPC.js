import MyDataChPeerConnection from "./MyDataChPeerConnection";

export default function makeConsumeDataChPC(id, ws, key, env, remake = false) {
    console.log('remake:' + remake);
    const _pc = new MyDataChPeerConnection(ws, {
        onNegotiationneeded: (ev) => {
            console.log(ev);
            (async () => {
                if (!remake) {
                    console.log('create offer');
                    await _pc.setLocalDesc(await _pc.createOffer());
                }
            })();
        },
        onIcecandidate: (ev) => {
            console.log(ev);
            if (ev.candidate === null && !remake) {
                console.log('send dc sdp');
                const to = 'default@890';
                const type = 'consume_dc';
                const sdp = _pc.conn.localDescription.sdp;
                const uuid = id;
                const json = {to, type, sdp, uuid, key, env};
                console.log(json);
                let count = 0;
                const iid = setInterval(function() {
                    if (_pc.ws.readyState === WebSocket.OPEN) {
                        _pc.ws.send(JSON.stringify(json));
                        clearInterval(iid);
                    }
                    if (count >= 10) clearInterval(iid);
                    count += 1;
                }, 1000);
            }
        }
    });
    return _pc;
}