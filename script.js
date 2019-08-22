
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
class AbstractPeerConnection {
    constructor() {
        this.conn = new RTCPeerConnection();
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
class ProducePeerConnection extends AbstractPeerConnection {
    constructor(webSocket) {
        super();
        this.ws = webSocket;
        this.conn.onnegotiationneeded = this.onNegotiationneeded();
        this.conn.onicecandidate = this.onIcecandidate();
        this.conn.ontrack = this.onTrack();
        this.consumers = [];
    }
    onNegotiationneeded() {
        return (ev) =>  console.log(ev);
    }
    onIcecandidate() {
        return (ev) => {
            console.log(ev);
            if (ev.candidate === null) {
                if (this.conn.remoteDescription !== null) {
                    const to = 'consume@890';
                    const uuid = uuidv1();
                    const type = 'produce';
                    const sdp = this.conn.localDescription.sdp;
                    const json = { to, uuid, type, sdp };
                    this.ws.send(JSON.stringify(json));
                }
            }
        };
    }
    onTrack() {
        return (ev) => console.log(ev);
    }
}
class ConsumePeerConnection extends AbstractPeerConnection {
    constructor(webSocket) {
        super();
        this.ws = webSocket;
        this.conn.onnegotiationneeded = this.onNegotiationneeded();
        this.conn.onicecandidate = this.onIcecandidate();
        this.conn.ontrack = this.onTrack();
        this.conn.addTransceiver('video', {direction: 'recvonly'});
        this.conn.addTransceiver('audio', {direction: 'recvonly'});
    }
    onNegotiationneeded() {
        return (ev) => {
            console.log(ev);
            (async() => {
                console.log('create and set offer');
                await this.setLocalDesc(await this.createOffer());
            })();
        };
    }
    onIcecandidate() {
        return (ev) => {
            console.log(ev);
            if (ev.candidate === null) {
                const to = 'default@890';
                const type = 'consume';
                const sdp = this.conn.localDescription.sdp;
                const uuid = uuidv1();
                const json = { to, type, sdp, uuid };
                this.ws.send(JSON.stringify(json));
            }
        };
    }
    onTrack() {
        return (ev) => {
            console.log(ev);
            remote.srcObject = ev.streams[0];
        };
    }
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('ready');
    const local = document.getElementById('local');
    const remote = document.getElementById('remote');
    const list = document.getElementById('list');
    document.getElementById('produceBtn').addEventListener('click', async (event) => {
        event.preventDefault();
        function makeList(consumer) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.innerHTML = consumer.uuid;
            a.href = '#';
            a.onclick = async (evt) => {
                evt.preventDefault();
                const offer = new RTCSessionDescription({
                    type: 'offer', sdp: consumer.sdp
                });
                await pc.setRemoteDesc(offer);
                await pc.setLocalDesc(await pc.createAnswer());
            };
            li.appendChild(a);
            return li;
        }
        let consumers = [];
        const ws = await makeWebSocket({
            auth: 'default@890', password: '19861012'
        }, (ev) => {
            console.log(ev);
            const json = JSON.parse(ev.data);
            console.log(json);
            if (json.type !== 'consume') return;
            consumers.push(json);
            list.innerHTML = '';
            consumers.forEach(e => list.appendChild(makeList(e)));
        });
        const pc = new ProducePeerConnection(ws);
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true, audio: false
        });
        local.srcObject = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        console.log(pc);
    }); 
    document.getElementById('consumeBtn').addEventListener('click', async (event) => {
        event.preventDefault();
        const ws = await makeWebSocket({
            auth: 'consume@890', password: '0749637637'
        }, (ev) => {
            console.log(ev);
            const json = JSON.parse(ev.data);
            console.log(json);
            if (json.type !== 'produce') return;
            const answer = new RTCSessionDescription({
                type: 'answer', sdp: json.sdp
            });
            (async () => {
                await pc.setRemoteDesc(answer);
            })();
        });
        const pc = new ConsumePeerConnection(ws);
        console.log(pc);
    });
});
