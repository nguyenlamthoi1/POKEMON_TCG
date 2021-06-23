cc.Class({
    extends: cc.Component,

    properties: {
        selectIndicator: cc.Node,
    },
    init: function(gm, holderType){
        this.gm = gm;
        this._type = holderType;
        this._card = {};
        this._card[CONST.CARD.CAT.PKM] = [];
        this._card[CONST.CARD.CAT.ENERGY] = [];
    },
    //Selection
    enableSelector: function(enabled){
        if(enabled){
            this.selectIndicator.color = cc.Color.GREEN;
            Utils.doUndulating(this.selectIndicator, 0.5, this.selectIndicator.scale, this.selectIndicator.scale * 1.5);
        }
        else{
            this.selectIndicator.color = cc.Color.WHITE;
            this.selectIndicator.stopAllActions();
        }
    },
    //Check
    hasPokemon: function(){
        return this._card[CONST.CARD.PKM].length > 0;
    }
});
