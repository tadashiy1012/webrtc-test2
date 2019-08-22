function makeWebSocket(auth, onMessageListener) {
    return new Promise((resolve, reject) => {
        const wsurl = "wss://cloud.achex.ca/signal";
        const ws = new WebSocket(wsurl);
        ws.onerror = (err) => console.error(err);
        ws.onopen = () => {
            ws.send(JSON.stringify(auth));
            resolve(ws);
        };
        ws.onclose = (ev) => console.log(ev);
        ws.onmessage = onMessageListener
        setTimeout(() => {
            reject(new Error('time out'));
        }, 30000);
    });
}

class MyPeerConnection {
    constructor(webSocket, {
        init,
        onNegotiationneeded,
        onIcecandidate,
        onTrack
    }) {
        this.ws = webSocket;
        this.conn = new RTCPeerConnection({
            iceServers: [
                {"urls": "stun:stun.l.google.com:19302"}
            ]
        });
        this.conn.onnegotiationneeded = onNegotiationneeded;
        this.conn.onicecandidate = onIcecandidate;
        this.conn.ontrack = onTrack;
        init(this.conn);
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
        this.conn.addTrack(track, stream);
    }
}

export {
    makeWebSocket,
    MyPeerConnection
}