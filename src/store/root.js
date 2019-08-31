import {observable, action} from 'mobx';
import { Bowl } from '../util';

const ModeState = Base => class extends Base {
    @observable mode = 'none';

    @action
    setMode(mode) {
        this.mode = mode;
    }
}

export default class RootStore extends ModeState(Bowl) {
}
