let iceServers = [
    {"urls": "stun:stun.l.google.com:19302"}
];

if (document.location.host === 'localhost:8080') {
    iceServers = [];
}

console.log(iceServers);

export {iceServers};