
cc.Class({
    extends: cc.Component,

    properties: {
        hpLb: cc.Label,
        pokemonNameLb: cc.Label,
        types: [cc.Node],
        typeFrames: [cc.SpriteFrame],
        cardBackground: cc.Sprite,
        cardBackgroundSF: [cc.SpriteFrame],
        pokemonSprite: cc.Sprite,
        //Bottom UI
        moves: [cc.Node],
        movePrefab: cc.Prefab,
        moveLayout: cc.Node,
        //mini Pool
    
    },
    init: function (cardId) {
        cc.log("INIT_BIG_CARD", JSON.stringify(JARVIS.getCardData(cardId).moveInfo));
        var cardData = JARVIS.getCardData(cardId);
        //Hp
        this.hpLb.string = cardData.hp;
        //Name
        this.pokemonNameLb.string = cardData.name;
        //Type
        for (var i = 0; i < this.types.length; i++)  this.types[i].active = false;
        for (var typeKey in cardData.type) {
            this.types[0].active = true;
            this.types[typeKey].getComponent(cc.Sprite).spriteFrame = this._getEnergySF(cardData.type[typeKey]);
        }
        //Card Background
        this.cardBackground.spriteFrame = this._getCardBackGroundSF(cardData.type[0]);
        //Pokemon
        this.pokemonSprite.spriteFrame = RES_MGR.getRes(cardData.bigPokemonUrl);
        //Set up move ui
        var i = 0;
        for (const move of this.moves){
            move.off(CONST.EVENT.DOUBLE_TOUCH, this._doubleTouchMove, this);
            move.active = false;
        }
        this.moveScr = [];
        for (const moveIdx in cardData.moveInfo) {
            if(i >= this.moves.length) {
                cc.log("test_i", i , this.moves.length);
                this.moves.push(cc.instantiate(this.movePrefab));
            }
            var moveUI = this.moves[i];
            moveUI.active = true;
            var moveData = cardData.moveInfo[moveIdx];
            moveUI.getComponent("MoveInfo").init(moveIdx, moveData);
            moveUI.on(CONST.EVENT.DOUBLE_TOUCH, this._doubleTouchMove, this);
            this.moveScr.push(moveUI.getComponent("MoveInfo"));
            if(!moveUI.parent) this.moveLayout.addChild(moveUI);
            i++;
        }

    },
    _doubleTouchMove: function(event){
        cc.log("used_move", event.component.moveData.name);
        this.node.emit("onusedmove", {moveIdx: event.component.moveIdx ,move: event.component.moveData})
    },
    _getEnergySF: function (type) {
        cc.log("test_type", type);
        switch (type) {
            case POKEMON.FIRE_TYPE:
                return this.typeFrames[0];
            case POKEMON.WATER_TYPE:
                return this.typeFrames[1];
            case POKEMON.GRASS_TYPE:
                return this.typeFrames[2];
            case POKEMON.ELECTRIC_TYPE:
                return this.typeFrames[3];
            default:
                return this.typeFrames[this.typeFrames.length - 1];
        }
    },
    _getCardBackGroundSF: function (type) {
        cc.log("test_type", type);
        switch (type) {
            case POKEMON.FIRE_TYPE:
                return this.cardBackgroundSF[0];
            case POKEMON.WATER_TYPE:
                return this.cardBackgroundSF[1];
            case POKEMON.GRASS_TYPE:
                return this.cardBackgroundSF[2];
            case POKEMON.ELECTRIC_TYPE:
                return this.cardBackgroundSF[3];
            default:
                return this.cardBackgroundSF[this.typeFrames.length - 1];
        }
    },
    _onTouchMoveUI: function(){

    },
    onReadyUsed: function(){
        for (const move of this.moves){
            move.getComponent("MoveInfo").onReadyUsed();
        }
    },
    onCancelUsed: function(){
        for (const move of this.moves){
            move.getComponent("MoveInfo").onCancelUsed();
        }
    },
    getMoves: function(){
        return this.moves;
    }
});
