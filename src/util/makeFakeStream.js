export default function makeFakeStream(audioCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    canvas.getContext('2d');
    const vStream = canvas.captureStream();
    const aStream = audioCtx.createMediaStreamDestination().stream;
    const [vTrack] = vStream.getVideoTracks();
    const [aTrack] = aStream.getAudioTracks();
    return new MediaStream([vTrack, aTrack]);
}