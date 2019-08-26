import * as uuidv1 from 'uuid/v1';

function makeWebSocket(auth, {
    onMessage = (ev) => console.log(ev),
    onOpen = (ev) => console.log(ev),
    onClose = (ev) => console.log(ev),
    onError = (err) => console.error(err)
}) {
    const wsurl = "wss://cloud.achex.ca/signal";
    const ws = new WebSocket(wsurl);
    ws.onerror = onError;
    ws.onopen = (ev) => {
        console.log(ev);
        ws.send(JSON.stringify(auth));
        ws.onopen = onOpen;
    };
    ws.onclose = onClose;
    ws.onmessage = onMessage;
    return ws;
}

function makeProducePC(ws, destination) { 
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

function makeConsumePC(ws, remake = false) {
    console.log('remake:' + remake);
    const _pc = new MyPeerConnection(ws, {
        onNegotiationneeded: (ev) => {
            console.log(ev);
            (async() => {
                if (!remake) {
                    console.log('create and set offer');
                    await _pc.setLocalDesc(await _pc.createOffer());
                }
            })();
        },
        onIcecandidate: (ev) => {
            console.log(ev);
            if (ev.candidate === null && !remake) {
                const to = 'default@890';
                const type = 'consume';
                const sdp = _pc.conn.localDescription.sdp;
                const uuid = _pc.id;
                const json = { to, type, sdp, uuid };
                let count = 0;
                const id = setInterval(function() {
                    console.log(_pc.ws.readyState);
                    if (_pc.ws.readyState === WebSocket.OPEN) {
                        _pc.ws.send(JSON.stringify(json));
                        clearInterval(id);
                    }
                    if (count >= 10) clearInterval(id);
                    count += 1
                }, 1000);
            }
        }
    });
    _pc.conn.addTransceiver('video', {direction: 'recvonly'});
    _pc.conn.addTransceiver('audio', {direction: 'recvonly'});
    return _pc;
}

class MyPeerConnection {
    constructor(webSocket, {
        onNegotiationneeded = (ev) => console.log(ev),
        onIcecandidate = (ev) => console.log(ev),
        onTrack = (ev) => console.log(ev)
    }) {
        this.id = uuidv1();
        this.ws = webSocket;
        this.conn = new RTCPeerConnection({
            iceServers: [
                {"urls": "stun:stun.l.google.com:19302"}
            ]
        });
        this.conn.onnegotiationneeded = onNegotiationneeded;
        this.conn.onicecandidate = onIcecandidate;
        this.conn.ontrack = onTrack;
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

export {
    makeWebSocket,
    makeProducePC,
    makeConsumePC
}