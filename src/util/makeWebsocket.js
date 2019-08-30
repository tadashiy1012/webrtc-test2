export default function makeWebSocket(auth, {
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
