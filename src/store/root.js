import {observable, action} from 'mobx';

export default class RootStore {
    @observable mode = 'none';

    @action
    setMode(mode) {
        this.mode = mode;
    }
}
