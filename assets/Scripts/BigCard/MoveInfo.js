
cc.Class({
    extends: cc.Component,

    properties: {
        moveName: cc.Label,
        moveValue: cc.Label,
        moveDes: cc.Label,
        energies: [cc.Node],
        energyFrames: [cc.SpriteFrame],
        back: cc.Node
    },
    init: function (moveIdx, moveData) {
        //var moveData = MOVE[moveData.moveId];
        this.moveIdx = moveIdx;
        this.moveData = moveData;
        this.moveName.string = moveData.name;
        this.moveValue.string = moveData.value;
        this.moveDes.string = moveData.des;
        this.back.active = false;
        this.back.color = cc.Color.WHITE;
        cc.log("INIT_MOVE", moveData.name, moveData.value, JSON.stringify(moveData.cost));

        for (const energy of this.energies) {
            energy.active = false;
        }
        var i = 0;

        for (const energy in moveData.cost) {
            for (var j = 0; j < moveData.cost[energy]; j++) {
                if (i >= this.energies.length) {
                    cc.log("test_i", i, this.energies.length);
                    this.energies.push(cc.instantiate(this.energies[0]));
                }
                var freeEnergy = this.energies[i];
                freeEnergy.active = true;
                freeEnergy.getComponent(cc.Sprite).spriteFrame = this._getEnergySF(energy);
                if (!freeEnergy.parent) this.energies[0].parent.addChild(freeEnergy);
                i++;
            }
        }

        //Listen to events
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStartInfo, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEndInfo, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEndInfo, this);
        this.node.on(CONST.EVENT.TOUCH_HOLD, this._onTouchHoldInfo, this);
        

        this._time = 0;
    },
    _getEnergySF: function (energy) {
        cc.log("test_type", energy, CONST.ENERGY.FIRE, CONST.ENERGY.NORMAL);
        switch (energy) {
            case CONST.ENERGY.FIRE:
                return this.energyFrames[0];
            case CONST.ENERGY.WATER:
                return this.energyFrames[1];
            case CONST.ENERGY.GRASS:
                return this.energyFrames[2];
            case CONST.ENERGY.ELECTRIC:
                return this.energyFrames[3];
            case CONST.ENERGY.NORMAL:
                return this.energyFrames[4];
            default:
                return this.energyFrames[this.energyFrames.length - 1];
        }
    },
    _onTouchStartInfo: function (event) {
        cc.log("touch_start",this._lastTouch);
        this._lastTouch =  false; //Stop counting time
        if(this._lastTouchTime > 0 && this._lastTouchTime < 0.2){
            cc.log("2_click");
            this.node.emit(CONST.EVENT.DOUBLE_TOUCH, {component: this});
            this.back.color = cc.Color.GREEN;
        }
       
        this._time = 0;
        this._startCount = true;
        this._holdTouch = event.touch;
        this._cb = this._processHoldTouch.bind(this);
        this.scheduleOnce(this._cb, 0.3, 0, 0); //holdingtime = 0.3


        //cc.tween(this.node).to(0.2, {scale: this.node.scale * 1.2}).start();
    },
    _onTouchEndInfo: function (event) {
        cc.log("touch_end");
        this._holdTouch = undefined;
        this._lastTouch =  true;
        this._lastTouchTime = 0;
        this._startCount = false;
        this.unschedule(this._cb);
        if(this.node.scale != 1)
            cc.tween(this.node).to(0.2, { scale: 1 }).start();
        
    },
    _onTouchHoldInfo: function () {
        cc.tween(this.node).to(0.2, { scale: this.node.scale * 1.2 }).start();
    },
    _processHoldTouch: function () {
        if (this._holdTouch) {
            cc.log("on_touch_hold", this._time);
            this.node.emit(CONST.EVENT.TOUCH_HOLD, { component: this});
            this._holdTouch == undefined;
        }
    },
    update: function (dt) {
        if (this._startCount) {
            this._time += dt;
            //cc.log(this._time);
        }
        if(this._lastTouch){
            this._lastTouchTime += dt;
        }
    },
    onReadyUsed: function(){
        cc.log("ACTIVE_BACK");
        this.back.active = true;
        this.back.scale = this.back.scale * 1.1;
        //cc.tween(this.node).to(0.2, { scale: this.node.scale * 1.2 }).start();
    },
    onCancelUsed: function(){
        this.back.active = false;
        this.back.scale = 1;
    }
});
