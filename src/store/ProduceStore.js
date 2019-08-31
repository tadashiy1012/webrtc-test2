import {observable, action, computed} from 'mobx';
import {Bowl} from '../util';
import {SimpleState} from './produce_SimpleState';
import {ListState} from './produce_ListState';
import {PeerConnState} from './produce_PeerConnState';

export default class ProduceStore extends SimpleState(ListState(PeerConnState(Bowl))) {}