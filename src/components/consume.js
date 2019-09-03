/** @jsx jsx */
import {jsx, css} from '@emotion/core';
import {inject, observer} from 'mobx-react';
import React, {Fragment} from 'react';
import {makeConsumeDataChPC, makeConsumePC} from '../util';
import ConsumeChatView from './ConsumeChatView';
import SelfVideoView from './SelfVideoView';
import RemoteVideoView from './RemoteVideoView';

@inject('root', 'consume')
@observer
export default class Consume extends React.Component {
    constructor(props) {
        super(props);
        this.props.root.setMode('consume');
        const params = (new URL(document.location)).searchParams;
        const key = params.get('key') || 'default';
        this.props.consume.setKey(key);
        this.props.consume.createWebSocket();
        this.props.consume.setWsOnMessageHandler((ev) => {
            console.log(ev);
            const json = JSON.parse(ev.data);
            console.log(json);
            if (json.type === 'produce') {
                if (this.props.consume.pc !== null 
                        && this.props.consume.id === json.destination) {
                    console.log('message to me (pc)');
                    this.props.consume.setRecievedAnswer(json.sdp);
                }
            } else if (json.type === 'produce_dc') {
                if (this.props.consume.dcPc !== null
                        && this.props.consume.id === json.destination) {
                    console.log('message to me (dcPc)');
                    this.props.consume.setDcRecievedAnswer(
                        json.sdp,
                        this.props.consume.key,
                        this.props.root.env
                    );
                }
            }
        });
        this.props.consume.setPC(makeConsumePC(
            this.props.consume.id, this.props.consume.ws, this.props.consume.key
        ));
        this.props.consume.setPcOnTrackHandler((ev) => {
            console.log(ev);
            console.log(ev.streams[0].getTracks());
            this.props.consume.setRecorder(ev.streams[0]);
            this.props.consume.target.srcObject = ev.streams[0];
        });
        this.props.consume.setDcPC(makeConsumeDataChPC(
            this.props.consume.id, this.props.consume.ws,
            this.props.consume.key, this.props.root.env
        ));
        this.props.consume.dcPc.createDataCh();
        this.props.consume.setDcOnMessage();
    }
    componentWillUnmount() {
        console.log('consume component unmount');
        this.props.consume.setWsOnMessageHandler(() => {});
        this.props.consume.unsetWebSocket();
        this.props.consume.setPC(null);
        this.props.consume.setDcPC(null);
        this.props.consume.setTarget(null);
        this.props.consume.setStream(null);
        this.props.consume.setStreamSelf(null);
        this.props.consume.unsetRecorder();
        this.props.consume.clearSays();
        this.props.consume.clearObjects();
        this.props.consume.regenerateId();
    }
    render() {
        const mq = [360, 576, 800].map(
            bp => `@media (min-width: ${bp}px)`
        );
        return <Fragment>
            <div css={{marginTop:'12px'}}>
                <div className='row no-gutters'>
                    <div className='col-md-9'>
                        <RemoteVideoView />
                    </div>
                    <div className='col-md-3' css={{[mq[0]]: {position:'absolute'}, [mq[2]]: {position:'static'}}}>
                        <SelfVideoView />
                    </div>
                </div>
                <ConsumeChatView />
            </div>
        </Fragment>
    }
}
