import {makeWebSocket, MyPeerConnection} from './util.js';

document.addEventListener('DOMContentLoaded', () => {
    const local = document.getElementById('local');
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
        const pc = new MyPeerConnection(ws, {
            init: () => {},
            onNegotiationneeded: (ev) => console.log(ev),
            onIcecandidate: (ev) => {
                console.log(ev);
                if (ev.candidate === null && pc.conn.remoteDescription !== null) {
                    const to = 'consume@890';
                    const uuid = uuidv1();
                    const type = 'produce';
                    const sdp = pc.conn.localDescription.sdp;
                    const json = { to, uuid, type, sdp };
                    pc.ws.send(JSON.stringify(json));
                }
            },
            onTrack: (ev) => console.log(ev)
        });
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true, audio: false
        });
        local.srcObject = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        console.log(pc);
    }); 
    const remote = document.getElementById('remote');
    const btn = document.getElementById('recBtn');
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
        let recorder = null;
        const pc = new MyPeerConnection(ws, {
            init: (conn) => {
                conn.addTransceiver('video', {direction: 'recvonly'});
                conn.addTransceiver('audio', {direction: 'recvonly'});
            },
            onNegotiationneeded: (ev) => {
                console.log(ev);
                (async() => {
                    console.log('create and set offer');
                    await pc.setLocalDesc(await pc.createOffer());
                })();
            },
            onIcecandidate: (ev) => {
                console.log(ev);
                if (ev.candidate === null) {
                    const to = 'default@890';
                    const type = 'consume';
                    const sdp = pc.conn.localDescription.sdp;
                    const uuid = uuidv1();
                    const json = { to, type, sdp, uuid };
                    pc.ws.send(JSON.stringify(json));
                }
            },
            onTrack: (ev) => {
                console.log(ev);
                remote.srcObject = ev.streams[0];
                recorder = new RecordRTC(ev.streams[0], {
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
        console.log(pc);
        let rec = false;
        btn.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (!recorder) return;
            if (rec) {
                btn.querySelector('span#icon').innerHTML = '⚫';
                recorder.stopRecording(() => {
                    const blob = recorder.getBlob();
                    console.log(blob);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'video.webm';
                    a.click();
                });
            } else {
                btn.querySelector('span#icon').innerHTML = '🔴';
                recorder.startRecording();
            }
            rec = !rec;
        });
    });
});
