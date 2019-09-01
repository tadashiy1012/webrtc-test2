/** @jsx jsx */
import React, {Fragment} from 'react';
import {observer, inject} from 'mobx-react';
import {makeProducePC} from '../util';
import {jsx, css} from '@emotion/core';

@inject('produce')
@observer
class Consumer extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const tgtPc = this.props.produce.pcs.find((e) => e.destination === this.props.uuid);
        const status = tgtPc ? tgtPc.status : false;
        return <li>
            <div className='row align-items-center no-gutters'>
                <div className='col-md-3'>
                    <video ref={(video) => {
                        if (video) {
                            this.props.produce.addTgt(video, this.props.uuid);
                        }
                    }} autoPlay className='img-fluid' css={{minHeight:'90px'}} />
                </div>
                <div className='col-md-7'>
                    <span>{status ? '✔️':'✖️'} </span>
                    <a href='#' onClick={this.props.handleClick}>{this.props.uuid} </a>
                </div>
                <div className='col-md-2'>
                    <button onClick={this.props.handleCloseClick}
                        disabled={status ? false:true} 
                        className='btn btn-danger btn-sm'>close</button>
                </div>
            </div>
        </li>
    }
}

@inject('produce')
@observer
export default class ConsumerList extends React.Component {
    onConsumerClick(dest, sdp) {
        const pc = makeProducePC(
            this.props.produce.ws, dest
        );
        pc.conn.ontrack = (ev) => {
            console.log(ev);
            console.log(ev.streams[0].getTracks());
            const tgt = this.props.produce.tgts.find(e => e.destination === dest);
            tgt.tgt.srcObject = ev.streams[0];
        };
        this.props.produce.addPeerConnection(pc, dest);
        const tgt = this.props.produce.findPeerConnection(dest);
        const idx = this.props.produce.pcIndexOf(tgt);
        this.props.produce.setPeerConnectionStatus(idx, true);
        this.props.produce.setPCsTrack();
        const offer = new RTCSessionDescription({
            type: 'offer', sdp
        });
        (async () => {
            await pc.setRemoteDesc(offer);
            await pc.setLocalDesc(await pc.createAnswer());
        })();
    }
    onCloseClick(dest) {
        const tgt = this.props.produce.findPeerConnection(dest);
        tgt.pc.conn.close();
        this.props.produce.setPeerConnectionStatus(
            this.props.produce.pcIndexOf(tgt), false
        );
        setTimeout(() => {
            this.props.produce.removePeerConnection(
                this.props.produce.pcIndexOf(tgt)
            );
            const ctgt = this.props.produce.findConsumer(tgt.destination);
            this.props.produce.removeConsumer(
                this.props.produce.consumerIndexOf(ctgt));
        }, 500);
    }
    render() {
        const childs = this.props.produce.consumers.map((e, idx) => {
            const tgtPc = this.props.produce.findPeerConnection(e.uuid);
            const status = tgtPc ? tgtPc.status : false;
            return <Consumer key={idx} uuid={e.uuid} handleClick={(evt) => {
                evt.preventDefault();
                if (!status) {
                    this.onConsumerClick(e.uuid, e.sdp);
                }
            }} handleCloseClick={(evt) => {
                evt.preventDefault();
                this.onCloseClick(e.uuid);
            }} />
        });
        return <Fragment>
            <div className='card' css={{display: this.props.produce.setting ? 'none':'block'}}>
                <div className='card-body'>
                    <h3 css={{fontSize:'18px'}}>consumers</h3>
                    <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{childs}</ul>
                </div>
            </div>
            <div className='card' css={{display: this.props.produce.setting ? 'block':'none'}}>
                <div className='card-body'>
                    <h3 css={{fontSize:'18px'}}>settings</h3>
                    <label>
                        <span>room key</span>
                        <input type='text' className='form-control' onChange={(ev) => {
                            this.props.produce.setKey(ev.target.value);
                        }} value={this.props.produce.key} />
                    </label>
                </div>
            </div>
            <div css={{marginTop:'4px', display:'grid', justifyContent:'end'}}>
                <button onClick={() => {
                    this.props.produce.toggleSetting();
                }} className='btn btn-secondary btn-sm'>
                    {this.props.produce.setting ? 'consumers':'settings'}
                </button>
            </div>
        </Fragment>
    }
}