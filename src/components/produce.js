/** @jsx jsx */
import React from 'react';
import {observer, inject} from 'mobx-react';
import {makeProduceDataChPC} from '../util';
import {jsx, css} from '@emotion/core';
import ChatView from './ChatView';
import ConsumerList from './ConsumerList';
import VideoView from './VideoView';

@inject('root', 'produce')
@observer
export default class Produce extends React.Component {
    constructor(props) {
        super(props);
        this.props.root.setMode('produce');
        this.props.produce.createWebSocket();
        this.props.produce.setWsOnMessageHandler((ev) => {
            console.log(ev);
            const json = JSON.parse(ev.data);
            console.log(json);
            if (json.key === this.props.produce.key) {
                if (json.type === 'consume') {
                    this.props.produce.addConsumers(json);
                } else if (json.type === 'consume_dc') {
                    const dcpc = makeProduceDataChPC(
                        this.props.produce.id, 
                        this.props.produce.ws, 
                        json.uuid, json.env);
                    dcpc.setOnMessageHandler((ev) => {
                        console.log(ev);
                        const json = JSON.parse(ev.data);
                        console.log(json);
                        this.props.produce.addSay(json.id, json.message);
                    });
                    this.props.produce.addDataChPeerConnection(dcpc);
                    const offer = new RTCSessionDescription({
                        type: 'offer', sdp: json.sdp
                    });
                    (async () => {
                        await dcpc.setRemoteDesc(offer);
                        await dcpc.setLocalDesc(await dcpc.createAnswer());
                    })();
                }
            }
        });
    }
    componentWillUnmount() {
        console.log('produce component unmount');
        this.props.produce.setCurrentStream(null);
        this.props.produce.setWsOnMessageHandler(() => {});
        this.props.produce.unsetWebSocket();
        this.props.produce.clearPeerConnections();
        this.props.produce.clearDataChPeerConnections();
        this.props.produce.clearConsumers();
        this.props.produce.clearTgts();
        this.props.produce.clearSays();
        this.props.produce.clearObjects();
        this.props.produce.regenerateId();
    }
    render() {
        return <div className='container-fluid'>
            <div className='row' css={{paddingTop:'8px'}}>
                <div className='col-md-7'>
                    <VideoView />
                </div>
                <div className='col-md-5'>
                    <ConsumerList />
                </div>
            </div>
            <div className='row'>
                <div className="col">
                    <ChatView />
                </div>
            </div>
        </div>
    }
}
