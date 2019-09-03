/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {jsx, css} from '@emotion/core';
import {} from '../util';

@inject('consume')
@observer
class PDFView extends React.Component {
    constructor(props) {
        super(props);
        this.pdfRef = React.createRef();
        this.props.consume.readPdf(this.props.tgt);
    }
    render() {
        const tgt = this.props.consume.objects.find(e => e.time === this.props.tgt.time);
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

@inject('consume')
@observer
export default class ConsumeChatView extends React.Component {
    constructor(props) {
        super(props);
        this.textRef = React.createRef();
    }
    handleSendClick() {
        this.props.consume.addSay('[me]', this.textRef.current.value);
        this.props.consume.dcPc.send(this.textRef.current.value);
    }
    render() {
        const mq = [360, 576, 800].map(
            bp => `@media (min-width: ${bp}px)`
        );
        const ary = [...this.props.consume.says, ...this.props.consume.objects].sort((a, b) => a.time - b.time);
        const children = ary.map((e, idx) => {
            console.log(e);
            if (e.say) {
                return <li key={idx}><span>{e.id.substring(0, 5)}</span> : <span>{e.say}</span></li>
            } else {
                if (e.obj.type === 'image/jpeg') {
                    return <li key={idx}>
                        <span>{e.id.substring(0, 5)}</span> : 
                        <div css={{padding:'2px'}}>
                            <img src={URL.createObjectURL(e.obj)} css={{
                                [mq[0]]: {width:'30%'}, [mq[2]]: {width:'30%'}, border:'solid 1px #ccc'
                            }} />
                            <br />
                            <a href={URL.createObjectURL(e.obj)} download='file'>download</a>
                        </div>
                    </li>
                } else if (e.obj.type === 'application/pdf') {
                    return <li key={idx}>
                        <span>{e.id.substring(0, 5)}</span> : 
                        <div className='card' css={{padding:'22px'}}>
                            <PDFView tgt={e} />
                            <a href={URL.createObjectURL(e.obj)} download='file'>download</a>
                        </div>
                    </li>
                } else {
                    return <li key={idx}>
                        <span>{e.id.substring(0, 5)}</span> : 
                        <a href={URL.createObjectURL(e.obj)} download='file'>download</a>
                    </li>
                }
            }
        }).reverse();
        return <Fragment>
            <div className='row'>
                <ul className='overflow-auto' css={{[mq[0]]:{height:'100px'}, [mq[2]]:{height:'300px'}, width:'100%'}}>
                    {children}
                </ul>
            </div>
            <div className='row'>
                <div className='col-12 col-md-9'>
                    <input type='text' ref={this.textRef} placeholder='message' className='form-control' />
                </div>
                <div className='col-12 col-md-3'>
                    <button onClick={() => {this.handleSendClick()}} className='btn btn-primary btn-block'>send message</button>
                </div>
            </div>
        </Fragment>
    }
}