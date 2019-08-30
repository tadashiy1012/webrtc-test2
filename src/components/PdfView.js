/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {} from '../util';
import {jsx, css} from '@emotion/core';

@inject('produce')
@observer
export default class PDFView extends React.Component {
    constructor(props) {
        super(props);
        this.pdfRef = React.createRef();
        this.props.produce.readPdf(this.props.tgt);
    }
    render() {
        const tgt = this.props.produce.objects.find(e => e.time === this.props.tgt.time);
        if (tgt.pdf !== null) {
            tgt.pdf.getPage(1).then((page) => {
                const scale = 0.7;
                const view = page.getViewport({scale});
                const canvas = this.pdfRef.current;
                const ctx = canvas.getContext('2d');
                canvas.height = view.height;
                canvas.width = view.width;
                page.render({
                    canvasContext: ctx,
                    viewport: view
                });
            });
        }
        return <canvas ref={this.pdfRef} className='rounded mx-auto d-block'></canvas>
    }
}