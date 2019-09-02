import {observable, action} from 'mobx';
import {getDoc} from '../util';

const ListState = Base => class extends Base {
    
    @observable says = [];
    @observable objects = [];

    @action
    addSay(id, say) {
        const time = Date.now();
        this.says.push({id, time, say});
    }

    @action
    clearSays() {
        this.says = [];
    }

    @action
    addObj(id, obj) {
        const time = Date.now();
        const tgt = {id, time, obj, pdf: null};
        this.objects.push(tgt);
    }

    @action
    clearObjects() {
        this.objects = [];
    }

    @action
    readPdf(object) {
        const tgt = this.objects.find(e => e.time === object.time);
        getDoc(object.obj).then((result) => {
            console.log(result);
            tgt.pdf = result;
        });
    }

}

export {
    ListState
};