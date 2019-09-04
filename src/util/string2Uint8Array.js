export default function string2Uint8Array(str) {
    return (new Uint8Array([].map.call(str, (c) => c.charCodeAt(0))));
}
