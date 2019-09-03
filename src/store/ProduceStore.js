import {observable, action, computed} from 'mobx';
import {Bowl} from '../util';
import {SimpleState} from './SimpleState';
import {ListState} from './ListState';
import {PeerConnState} from './PeerConnState';

export default class ProduceStore extends SimpleState(ListState(PeerConnState(Bowl))) {}