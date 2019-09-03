/** @jsx jsx */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'mobx-react';
import {jsx, css} from '@emotion/core';
import {RootStore, ProduceStore} from './store';
import {Produce} from './components';
import pdfjs from 'pdfjs-dist';
import "@babel/polyfill";
import 'bootstrap/dist/css/bootstrap.css';

pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.bundle.js';

const rootStore = new RootStore();

const App = () => (
    <Provider root={rootStore} produce={new ProduceStore()}>
        <div className='container'>
            <div className='row'>
                <div className='col-md-4'>
                    <h1 css={{margin:'0px'}}>webrtc-test2</h1>
                </div>
            </div>
            <div className='row'>
                <div className='col'>
                    <Produce />
                </div>
            </div>
        </div>
    </Provider>
);

ReactDOM.render(<App />, document.getElementById('app'));

window.onunload = () => {
    rootStore.audioCtx.close();
};