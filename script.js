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
        const uuid = uuidv1();
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
            onNegotiationneeded: (ev) => {
                console.log(ev);
                if (pc.conn.remoteDescription !== null) {
                    console.log('send sdp');
                    const to = 'consume@890';
                    const type = 'produce';
                    const sdp = pc.conn.localDescription.sdp;
                    const json = { to, uuid, type, sdp };
                    pc.ws.send(JSON.stringify(json));
                }
            },
            onIcecandidate: (ev) => {
                console.log(ev);
                if (ev.candidate === null) {
                    if (pc.conn.remoteDescription !== null) {
                        console.log('send sdp');
                        const to = 'consume@890';
                        const type = 'produce';
                        const sdp = pc.conn.localDescription.sdp;
                        const json = { to, uuid, type, sdp };
                        pc.ws.send(JSON.stringify(json));
                    }
                }
            },
            onTrack: (ev) => console.log(ev)
        });
        console.log(pc);
        let stream2;
        let stream3;
        document.getElementById('cameraBtn').addEventListener('click', async (ev) => {
            ev.preventDefault();
            stream2 = await navigator.mediaDevices.getUserMedia({
                video: true, audio: false
            });
            local.srcObject = stream2;
            if (stream3) {
                stream3.getTracks().forEach(track => {
                    track.enabled = !track.enabled;
                    track.stop();
                    stream3.removeTrack(track);
                });
            }
            const senders = pc.conn.getSenders();
            stream2.getTracks().forEach(track => {
                if (senders.length > 0) {
                    senders[0].replaceTrack(track);
                } else {
                    pc.addTrack(track, stream2);
                }
            });
            console.log('ok');
        });
        document.getElementById('displayBtn').addEventListener('click', async (ev) => {
            ev.preventDefault();
            stream3 = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });
            local.srcObject = stream3;
            if (stream2) {
                stream2.getTracks().forEach(track => {
                    track.enabled = !track.enabled;
                    track.stop();
                    stream2.removeTrack(track);
                });
            }
            let senders = pc.conn.getSenders();
            stream3.getTracks().forEach(track => {
                if (senders.length > 0) {
                    senders[0].replaceTrack(track);
                } else {
                    pc.addTrack(track, stream3);
                }
            });
            console.log('ok');            
        });
    }); 
    const remote = document.getElementById('remote');
    const btn = document.getElementById('recBtn');
    document.getElementById('consumeBtn').addEventListener('click', async (event) => {
        event.preventDefault();
        function makePC(ws, localDesc = null) {
            console.log('make pc > desc = ' + (localDesc ? 'not null' : 'null'));
            return new Promise((resolve, reject) => {
                const _pc = new MyPeerConnection(ws, {
                    init: (conn) => {
                        conn.addTransceiver('video', {direction: 'recvonly'});
                        conn.addTransceiver('audio', {direction: 'recvonly'});
                    },
                    onNegotiationneeded: (ev) => {
                        console.log(ev);
                        (async() => {
                            if (!localDesc) {
                                console.log('create and set offer');
                                await _pc.setLocalDesc(await _pc.createOffer());
                            }
                            console.log('make pc compl.');
                            resolve(_pc);
                        })();
                    },
                    onIcecandidate: (ev) => {
                        console.log(ev);
                        if (ev.candidate === null && !localDesc) {
                            const to = 'default@890';
                            const type = 'consume';
                            const sdp = _pc.conn.localDescription.sdp;
                            const uuid = uuidv1();
                            const json = { to, type, sdp, uuid };
                            _pc.ws.send(JSON.stringify(json));
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
            });
        }
        const ws = await makeWebSocket({
            auth: 'consume@890', password: '0749637637'
        }, (ev) => {
            console.log(ev);
            const json = JSON.parse(ev.data);
            console.log(json);
            if (json.type !== 'produce') return;
            const recievedAnswer = new RTCSessionDescription({
                type: 'answer', sdp: json.sdp
            });
            (async () => {
                if (pc.conn.remoteDescription !== null 
                        && pc.conn.remoteDescription !== recievedAnswer) {
                    const desc = pc.conn.localDescription;
                    try {
                        pc = await makePC(ws, desc);
                        console.log(1)
                        await pc.setLocalDesc(await pc.createOffer());
                        console.log(2)
                        await pc.setRemoteDesc(recievedAnswer);
                        console.log(3)
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    await pc.setRemoteDesc(recievedAnswer);
                }
            })();
        });
        let recorder = null;
        let pc = await makePC(ws, null);
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
