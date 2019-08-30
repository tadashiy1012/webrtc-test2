export default function string2TypedArray(str) {
    return (new Uint16Array([].map.call(str, (c) => c.charCodeAt(0))));
}
