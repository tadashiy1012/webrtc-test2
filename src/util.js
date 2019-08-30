import * as uuidv1 from 'uuid/v1';
import pdfjs from 'pdfjs-dist';

const iceServers = [
    {"urls": "stun:stun.l.google.com:19302"}
];

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

function makeConsumePC(id, ws, remake = false) {
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
                const json = { to, type, sdp, uuid };
                let count = 0;
                const iid = setInterval(function() {
                    if (_pc.ws.readyState === WebSocket.OPEN) {
                        _pc.ws.send(JSON.stringify(json));
                        clearInterval(iid);
                    }
                    if (count >= 10) clearInterval(iid);
                    count += 1
                }, 1000);
            }
        }
    });
    //_pc.conn.addTransceiver('video', {direction: 'recvonly'});
    //_pc.conn.addTransceiver('audio', {direction: 'recvonly'});
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
        this.conn = new RTCPeerConnection({ iceServers });
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

function makeProduceDataChPC(id, ws, destination) {
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
        }
    });
    _pc.overriteId(id);
    return _pc;
}

function makeConsumeDataChPC(id, ws, remake = false) {
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
                const json = {to, type, sdp, uuid};
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

class MyDataChPeerConnection {
    constructor(webSocket, {
        onNegotiationneeded = (ev) => console.log(ev),
        onIcecandidate = (ev) => console.log(ev)
    }) {
        this.id = uuidv1();
        this.ws = webSocket;
        this.conn = new RTCPeerConnection({ iceServers });
        this.conn.onnegotiationneeded = onNegotiationneeded;
        this.conn.onicecandidate = onIcecandidate;
        this.conn.ondatachannel = (ev) => {
            if (this.dc === null) {
                this.dc = ev.channel;
            }
        };
        this.dc = null;
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
    overriteId(id) {
        this.id = id;
    }
    createDataCh() {
        this.dc = this.conn.createDataChannel('chat');
        this.dc.onmessage = (ev) => console.log(ev);
        this.dc.onopen = (ev) => console.log(ev);
        this.dc.onclose = (ev) => console.log(ev);
        this.dc.onerror = (err) => console.error(err);
    }
    setOnMessageHandler(handler = (ev) => console.log(ev)) {
        const self = this;
        let count = 0;
        const id = setInterval(function() {
            if (self.dc !== null) {
                self.dc.onmessage = handler;
                clearInterval(id);
            }
            if (count >= 30) { 
                clearInterval(id);
                throw new Error('time out');
            }
            count += 1;
        }, 1000);
    }
    send(msg) {
        const json = {id: this.id, message: msg};
        this.dc.send(JSON.stringify(json));
    }
    sendBlob(blob) {
        const fr = new FileReader()
        fr.onload = (ev) => {
            console.log(ev);
            const file = new Uint16Array(fr.result);
            const id = string2TypedArray(this.id);
            const type = string2TypedArray(blob.type);
            const header = new Uint16Array(100);
            header.set(id);
            header.set(type, id.length);
            let tary = new Uint16Array(header.length + file.length);
            tary.set(header);
            tary.set(file, header.length);
            this.dc.send(tary);
        };
        fr.readAsArrayBuffer(blob);
    }
}

function string2TypedArray(str) {
    return (new Uint16Array([].map.call(str, (c) => c.charCodeAt(0))));
}

function tArray2String(ary) {
    return String.fromCharCode.apply("", ary);
}

const getDoc = (file) => {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.addEventListener('load', async (ev) => {
            const buf = ev.target.result;
            try {
                const task = pdfjs.getDocument(new Uint8Array(buf));
                task.promise.then((doc) => {
                    resolve(doc);
                });
            } catch (err) {
                reject(err);
            }
        });
        fr.readAsArrayBuffer(file);
    });
}

const makeThumbnail = (doc) => {
    return new Promise(async (resolve, reject) => {
        const page = await doc.getPage(1);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport(0.3);
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        });
        canvas.toBlob((resp) => {
            resolve(resp);
        }, 'image/png');
    });
};

export {
    makeWebSocket,
    makeProducePC,
    makeConsumePC,
    MyPeerConnection,
    MyDataChPeerConnection,
    makeProduceDataChPC,
    makeConsumeDataChPC,
    tArray2String,
    getDoc,
    makeThumbnail
}