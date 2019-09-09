import {observable, action, computed} from 'mobx';

const PeerConnState = Base => class extends Base {

    @observable pcs = [];
    @observable dcPCs = [];
    
    @action 
    addPeerConnection(pc, destination) {
        const pcObj = {pc, destination, status: false};
        this.pcs.push(pcObj);
    }
    
    @action
    findPeerConnection(destination) {
        return this.pcs.find(e => e.destination === destination);
    }

    @action
    pcIndexOf(tgt) {
        return this.pcs.indexOf(tgt);
    }

    @action
    removePeerConnection(idx) {
        this.pcs.splice(idx, 1);
    }

    @action
    setPeerConnectionStatus(idx, status) {
        this.pcs[idx].status = status;
        this.pcs = Object.assign([], this.pcs);
    }

    @action
    setPCsTrack() {
        this.pcs.map(e => e.pc).forEach(pc => {
            const senders = pc.conn.getSenders();
            this.currentStream.getTracks().forEach(track => {
                if (senders.length > 0 && track.kind === 'video') {
                    const videoSender = senders.find(e => e.track.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(track);
                    } else {
                        pc.addTrack(track, this.currentStream);
                    }
                } else if (senders.length > 0 && track.kind === 'audio') {
                    const audioSender = senders.find(e => e.track.kind === 'audio');
                    if (audioSender) {
                        audioSender.replaceTrack(track);
                    } else {
                        pc.addTrack(track, this.currentStream);
                    }
                } else {
                    pc.addTrack(track, this.currentStream);
                }
            });
        });
    }

    @action
    clearPeerConnections() {
        this.pcs = [];
    }
    
    @action
    addDataChPeerConnection(dcpc) {
        this.dcPCs.push(dcpc);
    }

    @action
    clearDataChPeerConnections() {
        this.dcPCs = [];
    }

}

export {
    PeerConnState
};