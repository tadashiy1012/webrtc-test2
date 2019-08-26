import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router, Route, Link} from 'react-router-dom';
import {observer, inject, Provider} from 'mobx-react';
import {RootStore, ProduceStore, ConsumeStore} from './store';
import {Produce, Consume} from './components';

const App = () => (
    <Provider root={new RootStore()} produce={new ProduceStore()} consume={new ConsumeStore()}>
        <Router>
            <Fragment>
                <h1>webrtc-test2</h1>
                <div>
                    <Link to='/produce'>produce</Link>
                    <Route path='/produce/' component={Produce} />
                </div>
                <div>
                    <Link to='/consume'>consume</Link>
                    <Route path='/consume/' component={Consume} />
                </div>
            </Fragment>
        </Router>
    </Provider>
);

ReactDOM.render(<App />, document.getElementById('app'));