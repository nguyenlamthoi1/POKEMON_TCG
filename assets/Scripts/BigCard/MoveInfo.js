
cc.Class({
    extends: cc.Component,

    properties: {
        moveName: cc.Label,
        moveValue: cc.Label,
        moveDes: cc.Label,
        energies: [cc.Node],
        energyFrames: [cc.SpriteFrame]
    },
    init: function(moveData){
        //var moveData = MOVE[moveData.moveId];
        this.moveName.string = moveData.name;
        this.moveValue.string = moveData.value;
        this.moveDes.string = moveData.des;
        cc.log("INIT_MOVE", moveData.name, moveData.value, JSON.stringify(moveData.cost));
       
        for (const energy of this.energies){
            energy.active = false;
        }
        var i = 0;

        for (const energy in moveData.cost) {
            for(var j = 0; j < moveData.cost[energy]; j ++){
                if(i >= this.energies.length) {
                    cc.log("test_i", i , this.energies.length);
                    this.energies.push(cc.instantiate(this.energies[0]));
                }
                var freeEnergy = this.energies[i];
                freeEnergy.active = true;
                freeEnergy.getComponent(cc.Sprite).spriteFrame = this._getEnergySF(energy);
                if(!freeEnergy.parent) this.energies[0].parent.addChild(freeEnergy);
                i++;
            } 
        }
           
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStartInfo, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEndInfo, this);
    },
    _getEnergySF: function (energy) {
        cc.log("test_type", energy,CONST.ENERGY.FIRE,CONST.ENERGY.NORMAL);
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
    _onTouchStartInfo: function(){
        cc.tween(this.node).to(0.2, {scale: this.node.scale * 1.2}).start();
    },
    _onTouchEndInfo: function(){
        cc.tween(this.node).to(0.2, {scale: this.node.scale / 1.2}).start();
    }
});
