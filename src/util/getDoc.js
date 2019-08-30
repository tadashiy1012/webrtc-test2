import pdfjs from 'pdfjs-dist';

export default function getDoc(file) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.addEventListener('load', async (ev) => {
            const buf = ev.target.result;
            try {
                const task = pdfjs.getDocument(new Uint8Array(buf));
                task.promise.then((doc) => {
                    resolve(doc);
                });
            } catch (err) {
                reject(err);
            }
        });
        fr.readAsArrayBuffer(file);
    });
}