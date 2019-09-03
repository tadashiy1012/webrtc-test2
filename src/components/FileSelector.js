/** @jsx jsx */
import React from 'react';
import {observer, inject} from 'mobx-react';
import {string2TypedArray} from '../util';
import {jsx, css} from '@emotion/core';
import {encode} from 'base64-arraybuffer-es6';

@inject('produce', 'root')
@observer
export default class FileSelector extends React.Component {
    constructor(props) {
        super(props)
        this.fileRef = React.createRef();
    }
    handleSendClick() {
        console.log(this.fileRef.current.files);
        this.props.produce.addObj('[me]', this.fileRef.current.files[0]);
        const fr = new FileReader();
        fr.onload = () => {
            console.log(fr.result);
                const file = new Uint16Array(fr.result);
                const type = string2TypedArray(this.fileRef.current.files[0].type);
                this.props.produce.dcPCs.forEach((dcpc) => {
                    const id = string2TypedArray(dcpc.id);
                    const header = new Uint16Array(100);
                    header.set(id);
                    header.set(type, id.length);
                    let tary = new Uint16Array(header.length + file.length);
                    tary.set(header);
                    tary.set(file, header.length);
                    console.log(tary);
                    if (dcpc.env !== 'chrome') {
                        const b64 = encode(tary.buffer, 0, tary.length);
                        dcpc.sendBase64(b64);
                    } else {
                        dcpc.sendBlob(tary);
                    }
                });
        };
        fr.readAsArrayBuffer(this.fileRef.current.files[0]);
    }
    render() {
        return <div>
            <div css={{padding:'12px 0px;'}}>
                <input type='file' ref={this.fileRef} accept='.jpg,.png,.pdf' className='form-control-file' />
            </div>
            <button onClick={() => {this.handleSendClick()}} className='btn btn-primary btn-block'>send file</button>
        </div>
    }
}