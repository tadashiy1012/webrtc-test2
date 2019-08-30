import pdfjs from 'pdfjs-dist';

export default function getThumb (doc) {
    return new Promise(async (resolve, reject) => {
        const page = await doc.getPage(1);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport(0.3);
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        });
        canvas.toBlob((resp) => {
            resolve(resp);
        }, 'image/png');
    });
};
