/** @jsx jsx */
import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router, Route, Link} from 'react-router-dom';
import {Provider} from 'mobx-react';
import {jsx, css} from '@emotion/core';
import {RootStore, ProduceStore, ConsumeStore} from './store';
import {Produce, Consume} from './components';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
import pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.bundle.js';

const App = () => (
    <Provider 
        root={new RootStore()} 
        produce={new ProduceStore()} 
        consume={new ConsumeStore()}
    >
        <Router>
            <div className='container'>
                <div className='row'>
                    <div className='col'><h1>webrtc-test2</h1></div>
                </div>
                <div className='row'>
                    <div className='col'>
                        <Link to='/produce'>produce</Link>
                        <Route path='/produce/' component={Produce} />
                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                        <Link to='/consume'>consume</Link>
                        <Route path='/consume/' component={Consume} />
                    </div>
                </div>
            </div>
        </Router>
    </Provider>
);

ReactDOM.render(<App />, document.getElementById('app'));