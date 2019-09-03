/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {} from '../util';
import {jsx, css} from '@emotion/core';
import FileSelector from './FileSelector';
import PDFView from './PdfView';

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
                console.log(e);
                if (e.obj.type === 'image/jpeg') {
                    return <li key={idx}>
                        <span>{e.id.substring(0, 5)}</span> : 
                        <div className='card' css={{padding:'22px'}}>
                            <img src={URL.createObjectURL(e.obj)} className='rounded mx-auto d-block' />
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
                <ul>
                    {children}
                </ul>
            </div>
        </Fragment>
    }
}