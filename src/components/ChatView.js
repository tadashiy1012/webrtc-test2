/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {} from '../util';
import {jsx, css} from '@emotion/core';
import FileSelector from './FileSelector';
import PDFView from './PdfView';

const ImageSay = (props) => (
    <li>
        <span>{props.id.substring(0, 5)}</span> : 
        <div className='card' css={{padding:'22px'}}>
            <img src={URL.createObjectURL(props.img)} className='rounded mx-auto d-block' />
        </div>
    </li>
);

const PdfSay = (props) => (
    <li>
        <span>{props.id.substring(0, 5)}</span> : 
        <div className='card' css={{padding:'22px'}}>
            <PDFView tgt={props.tgt} />
        </div>
    </li>
);

const ObjSay = (props) => (
    <li>
        <span>{props.id.substring(0, 5)}</span> : 
        <a href={URL.createObjectURL(props.obj)} download='file'>download</a>
    </li>
);

@inject('produce')
@observer
export default class ChatView extends React.Component {
    constructor(props) {
        super(props);
        this.textRef = React.createRef();
    }
    handleSendClick() {
        this.props.produce.addSay('[me]', this.textRef.current.value);
        this.props.produce.dcPCs.forEach((dcpc) => {
            dcpc.send(this.textRef.current.value);
        });
    }
    render() {
        const ary = [...this.props.produce.says, ...this.props.produce.objects].sort((a, b) => a.time - b.time);
        const children = ary.map((e, idx) => {
            if (e.say) {
                return <li key={idx}><span>{e.id.substring(0, 5)}</span> : <span>{e.say}</span></li>
            } else {
                if (e.obj.type === 'image/jpeg') {
                    return <ImageSay key={idx} id={e.id} img={e.obj} />
                } else if (e.obj.type === 'application/pdf') {
                    return <PdfSay key={idx} id={e.id} tgt={e} />
                } else {
                    return <ObjSay key={idx} id={e.id} obj={e.obj} />
                }
            }
        }).reverse();
        return <div className='row'>
            <div className='col-md-6'>
                <div css={{padding:'8px 0px'}}>
                    <input type='text' ref={this.textRef} placeholder='message' className='form-control' />
                </div>
                <button onClick={() => {this.handleSendClick()}} className='btn btn-primary btn-block'>send message</button>
            </div>
            <div className='col-md-6'>
                <FileSelector />
            </div>
            <div className="w-100"></div>
            <div className='col'>
                <h4>chat log</h4>
                <ul>
                    {children}
                </ul>
            </div>
        </div>
    }
}