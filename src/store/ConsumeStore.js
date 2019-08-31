import {Bowl} from '../util';
import {SimpleState} from './consume_SimpleState';
import {ListState} from './consume_ListState';
import {PeerConnState} from './consume_PeerConnState';

export default class ConsumeStore extends SimpleState(ListState(PeerConnState(Bowl))) {}