function makeWebSocket(auth, {
    onMessage = (ev) => console.log(ev),
    onOpen = (ev) => console.log(ev),
    onClose = (ev) => console.log(ev),
    onError = (err) => console.error(err)
}) {
    return new Promise((resolve, reject) => {
        const wsurl = "wss://cloud.achex.ca/signal";
        const ws = new WebSocket(wsurl);
        ws.onerror = onError;
        ws.onopen = (ev) => {
            ws.send(JSON.stringify(auth));
            onOpen(ev);
            resolve(ws);
        };
        ws.onclose = onClose;
        ws.onmessage = onMessage;
        setTimeout(() => {
            reject(new Error('time out'));
        }, 30000);
    });
}

function makeList(consumer, onClickListener) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.innerHTML = consumer.uuid;
    a.href = '#';
    a.onclick = onClickListener;
    li.appendChild(a);
    return li;
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

function makeConsumePC(ws, recorder, remake = false) {
    console.log(recorder, remake);
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
                _pc.ws.send(JSON.stringify(json));
            }
        },
        onTrack: (ev) => {
            console.log(ev);
            remote.srcObject = ev.streams[0];
            recorder.instance = new RecordRTC(ev.streams[0], {
                type: 'video',
                mimeType: 'video/webm',
                recorderType: WebAssemblyRecorder,
                timeSlice: 1000,
                checkForInactiveTracks: true,
                videoBitsPerSecond: 512000,
                frameInterval: 90,
            });
        }
    });
    _pc.conn.addTransceiver('video', {direction: 'recvonly'});
    _pc.conn.addTransceiver('audio', {direction: 'recvonly'});
    return _pc;
}

function switchStreams(pcls, streamA, streamB) {
    if (streamB) {
        streamB.getTracks().forEach(track => {
            track.enabled = !track.enabled;
            track.stop();
            streamB.removeTrack(track);
        });
    }
    pcls.forEach((pc) => {
        const senders = pc.conn.getSenders();
        streamA.getTracks().forEach(track => {
            if (senders.length > 0) {
                senders[0].replaceTrack(track);
            } else {
                pc.addTrack(track, streamA);
            }
        });
    });
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
    makeList,
    makeProducePC,
    makeConsumePC,
    switchStreams,
    MyPeerConnection
}