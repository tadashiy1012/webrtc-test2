import {
    makeWebSocket,
    makeList,
    makeProducePC,
    makeConsumePC,
    switchStreams
} from './util.js';

document.addEventListener('DOMContentLoaded', () => {
    const local = document.getElementById('local');
    const list = document.getElementById('list');
    const remote = document.getElementById('remote');
    const consumeBtn = document.getElementById('consumeBtn');
    const produceBtn = document.getElementById('produceBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const displayBtn = document.getElementById('displayBtn');
    const recBtn = document.getElementById('recBtn');
    produceBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        let pcls = [];
        let consumers = [];
        let stream2;
        let stream3;
        const ws = await makeWebSocket({
            auth: 'default@890', password: '19861012'
        }, {
            onMessage: (ev) => {
                console.log(ev);
                const json = JSON.parse(ev.data);
                console.log(json);
                if (json.type !== 'consume') return;
                consumers.push(json);
                list.innerHTML = '';
                consumers.forEach(e => list.appendChild(makeList(e, async (evt) => {
                    evt.preventDefault();
                    const pc = makeProducePC(ws, e.uuid);
                    pcls.push(pc);
                    const offer = new RTCSessionDescription({
                        type: 'offer', sdp: e.sdp
                    });
                    switchStreams([pc], stream2, stream3);
                    await pc.setRemoteDesc(offer);
                    await pc.setLocalDesc(await pc.createAnswer());
                })));
            }
        });
        cameraBtn.addEventListener('click', async (ev) => {
            ev.preventDefault();
            stream2 = await navigator.mediaDevices.getUserMedia({
                video: true, audio: false
            });
            local.srcObject = stream2;
            switchStreams(pcls, stream2, stream3);
        });
        displayBtn.addEventListener('click', async (ev) => {
            ev.preventDefault();
            stream3 = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });
            local.srcObject = stream3;
            switchStreams(pcls, stream3, stream2);
        });
        cameraBtn.click();
    }); 
    consumeBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        const ws = await makeWebSocket({
            auth: 'consume@890', password: '0749637637'
        }, {
            onMessage: (ev) => {
                console.log(ev);
                const json = JSON.parse(ev.data);
                console.log(json);
                if (json.type !== 'produce' || pc.id !== json.destination) return;
                console.log('my message');
                const recievedAnswer = new RTCSessionDescription({
                    type: 'answer', sdp: json.sdp
                });
                (async () => {
                    if (pc.conn.remoteDescription !== null 
                            && pc.conn.remoteDescription !== recievedAnswer) {
                        pc = makeConsumePC(ws, recorder, true);
                        await pc.setLocalDesc(await pc.createOffer());
                    }
                    await pc.setRemoteDesc(recievedAnswer);
                })();
            }
        });
        let recorder = {instance: null};
        let pc = makeConsumePC(ws, recorder, false);
        let rec = false;
        recBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (!recorder.instance) return;
            if (rec) {
                recBtn.querySelector('span#icon').innerHTML = '⚫';
                recorder.instance.stopRecording(() => {
                    const blob = recorder.instance.getBlob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'video.webm';
                    a.click();
                });
            } else {
                recBtn.querySelector('span#icon').innerHTML = '🔴';
                recorder.instance.startRecording();
            }
            rec = !rec;
        });
    });
});
