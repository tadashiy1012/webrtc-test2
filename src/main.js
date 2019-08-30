/** @jsx jsx */
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router, Route, Link} from 'react-router-dom';
import {Provider} from 'mobx-react';
import {jsx, css} from '@emotion/core';
import {RootStore, ProduceStore, ConsumeStore} from './store';
import {Produce, Consume} from './components';
import pdfjs from 'pdfjs-dist';
import 'bootstrap/dist/css/bootstrap.css';

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
                    <div className='col-md-4'>
                        <h1 css={{margin:'0px'}}>webrtc-test2</h1>
                    </div>
                    <div className='col-sm-8' css={{paddingTop:'8px'}}>
                        <Link to='/produce' className="btn btn-primary" role="button">produce</Link>
                        <span> </span>
                        <Link to='/consume' className="btn btn-primary" role="button">consume</Link>
                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                        <Route path='/produce/' component={Produce} />
                    </div>
                </div>
                <div className='row' css={{marginTop:'8px'}}>
                    <div className='col'>
                        <Route path='/consume/' component={Consume} />
                    </div>
                </div>
            </div>
        </Router>
    </Provider>
);

ReactDOM.render(<App />, document.getElementById('app'));