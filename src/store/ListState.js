import {observable, action, computed} from 'mobx';
import {getDoc} from '../util';

const ListState = Base => class extends Base {

    @observable consumers = [];
    @observable tgts = [];
    @observable says = [];
    @observable objects = [];
    
    @action
    addConsumers(consumer) {
        this.consumers.push(consumer);
    }
    
    @action
    removeConsumer(idx) {
        this.consumers.splice(idx, 1);
    }

    @action
    clearConsumers(flg = false) {
        if (flg) {
            const filtered = this.consumers.filter((e) => {
                return this.pcs.filter((ee) => {
                    return ee.destination === e.uuid
                }).length > 0;
            });
            this.consumers = filtered;
        } else {
            this.consumers = [];
        }
    }

    @action
    findConsumer(uuid) {
        return this.consumers.find(e => e.uuid === uuid);
    }

    @action
    consumerIndexOf(tgt) {
        return this.consumers.indexOf(tgt);
    }

    @action
    addTgt(tgt, destination) {
        this.tgts.push({tgt, destination});
    }

    @action
    clearTgts() {
        this.tgts = [];
    }

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
        const target = this.objects.find(e => e.time === object.time);
        getDoc(object.obj).then((result) => {
            console.log(result);
            target.pdf = result;
        });
    }

}

export {
    ListState
};