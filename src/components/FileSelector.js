/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {} from '../util';
import {jsx, css} from '@emotion/core';

@inject('produce')
@observer
export default class FileSelector extends React.Component {
    constructor(props) {
        super(props)
        this.fileRef = React.createRef();
    }
    handleSendClick() {
        console.log(this.fileRef.current.files);
        this.props.produce.addObj('[me]', this.fileRef.current.files[0]);
        this.props.produce.dcPCs.forEach((dcpc) => {
            dcpc.sendBlob(this.fileRef.current.files[0]);
        });
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