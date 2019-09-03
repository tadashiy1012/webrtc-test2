import {observable, action} from 'mobx';
import { Bowl } from '../util';

const ModeState = Base => class extends Base {
    
    @observable mode = 'none';
    @observable audioCtx = null;
    @observable env = null;

    constructor() {
        super();
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        const userAgent = window.navigator.userAgent.toLowerCase();
        if(userAgent.indexOf('msie') !== -1 || userAgent.indexOf('trident') !== -1) {
            this.env = 'ie';
        } else if(userAgent.indexOf('edge') !== -1) {
            this.evn = 'edge';
        } else if(userAgent.indexOf('chrome') !== -1) {
            this.env = 'chrome';
        } else if(userAgent.indexOf('safari') !== -1) {
            this.env = 'safari';
        } else if(userAgent.indexOf('firefox') !== -1) {
            this.env = 'firefox';
        } else {
            this.env = 'unknown';
        }
    }

    @action
    setMode(mode) {
        this.mode = mode;
    }

}

export default class RootStore extends ModeState(Bowl) {
}
