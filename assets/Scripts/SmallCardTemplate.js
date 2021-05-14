// const POKEMON = {
//     FIRE_TYPE: "fire_type",
//     GRASS_TYPE: "grass_type",
//     WATER_TYPE: "water_type",
//     ELECTRIC_TYPE: "elec_type"
// }

cc.Class({
    extends: cc.Component,

    properties: {
        id: -1,
        cardImg: cc.Sprite,
        cardTitleText: cc.Label,
        cardTypeText: cc.Label,
        cardContainer: cc.Sprite,
         //Evolution UI
        evolutionIcon: cc.Sprite,
        evolutionTxt: cc.Label,
        //PKM Type UI
        types: [cc.Node],
        typeFrames: [cc.SpriteFrame],

        cardFrames: [cc.SpriteFrame],
        colorTxt: [cc.Color],
        //Failed SF
        failedPkmSF: cc.SpriteFrame,
        failedEnergySF: cc.SpriteFrame
       
    },
    init: function(data, idxInHand, dropChecker, handUI, cardId){
        cc.log("INIT_CARD", idxInHand, cardId, JSON.stringify(data));
        this.cardId = cardId;
        this.handUI = handUI;
        this.owner = handUI.player;
        this.dropChecker = dropChecker;
        this.idxInHand = idxInHand;
        this.data = data;
        this.category = data.category;

        switch(this.category){
            case CONST.CARD.CAT.PKM: //If this is pokemon card
                this._initPkmCard(data);
                break;
            case CONST.CARD.CAT.ENERGY://If this is pokemon card
                this._initEnergyCard(data);
                break;
        }
        
        
        //Listeners
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchCardStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchCardEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCardCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchCardMove, this);
        this.handUI.player.registerEvent("droppable-changed", this.onCanDropChanged, this);
        this._isDroppable = this.handUI.player.isDropEnabled();
    },
    _initPkmCard:function(data){
        //Card name
        this.cardTitleText.string = data.name;
        this.cardTitleText.enabled = false;
        this.cardTitleText.node.color = this._getColorTxt(data.type);
        //Card category title
        this.cardTypeText.string = data.category;
        //Card container
        this.cardContainer.spriteFrame = this._getCardFrame(data.type);
        //Load Pokemon
        this.cardImg.node.scale = data.smallScale ? data.smallScale: 1;
        this._loadSpriteFrameForCardImg(data.smallCardUrl, this.failedPkmSF); //Load dymanically
        //Evolution info
        this.evolutionIcon.node.active = data.stage > 1;
        this.evolutionTxt.string = data.stage - 1;
        //Type PKM info: fire, water,..
        for(var i = 0; i < this.types.length; i ++)  this.types[i].active = false;
        for (var typeKey in data.type) { 
            this.types[typeKey].active = true;
            this.types[typeKey].getComponent(cc.Sprite).spriteFrame = this._getTypeFrame(data.type[typeKey]);
        }
        
    },
    _initEnergyCard: function(data){
        //Card name
        this.cardTitleText.string = data.name;
        this.cardTitleText.enabled = false;
        this.cardTitleText.node.color = this._getColorTxt(data.energyType);
        //Card category title
        this.cardTypeText.string = data.category;
        //Card container
        this.cardContainer.spriteFrame = this._getCardFrame(data.energyType);       
        //Load energy
        this.cardImg.node.scale = data.smallScale ? data.smallScale : 1;
        this._loadSpriteFrameForCardImg(data.smallCardUrl, this.failedEnergySF);//Load dymanically
        //Turn off
        this.evolutionIcon.node.active = false;
        for(var i = 0; i < this.types.length; i ++)  this.types[i].active = false;
    },
    _getCardFrame: function(type){
        if(this.category  == CONST.CARD.CAT.PKM){
            switch(type[0]){
                case POKEMON.FIRE_TYPE:
                    return this.cardFrames[0];
                case POKEMON.WATER_TYPE:
                    return this.cardFrames[1];
                case POKEMON.GRASS_TYPE:
                    return this.cardFrames[2];
                case POKEMON.ELECTRIC_TYPE:
                    return this.cardFrames[3];
                default: 
                    return this.cardFrames[this.cardFrames.length - 1];
            }
        }
        if(this.category == CONST.CARD.CAT.ENERGY){
            switch(type){
                case CONST.ENERGY.FIRE:
                    return this.cardFrames[4];
                case CONST.ENERGY.WATER:
                    return this.cardFrames[1];
                case CONST.ENERGY.GRASS:
                    return this.cardFrames[2];
                case CONST.ENERGY.ELECTRIC:
                    return this.cardFrames[3];
                case CONST.ENERGY.NORMAL:
                    return this.cardFrames[5];
                default: 
                    return this.cardFrames[this.colorTxt.length - 1];
            }
        }
        
    },
    _getColorTxt: function(type){
        if(this.category  == CONST.CARD.CAT.PKM){
            switch(type[0]){
                case POKEMON.FIRE_TYPE:
                    return this.colorTxt[0];
                case POKEMON.WATER_TYPE:
                    return this.colorTxt[1];
                case POKEMON.GRASS_TYPE:
                    return this.colorTxt[2];
                case POKEMON.ELECTRIC_TYPE:
                    return this.colorTxt[3];
                default: 
                    return this.colorTxt[this.colorTxt.length - 1];
            }
        }
        if(this.category == CONST.CARD.CAT.ENERGY){
            switch(type){
                case CONST.ENERGY.FIRE:
                    return this.colorTxt[4];
                case CONST.ENERGY.WATER:
                    return this.colorTxt[1];
                case CONST.ENERGY.GRASS:
                    return this.colorTxt[2];
                case CONST.ENERGY.ELECTRIC:
                    return this.colorTxt[3];
                case CONST.ENERGY.NORMAL:
                        return this.colorTxt[5];
                default:                 
                    return this.colorTxt[this.colorTxt.length - 1];
            }
        }
       
    },
    _getTypeFrame: function(type){
        switch(type){
            case POKEMON.FIRE_TYPE:
                return this.typeFrames[0];
            case POKEMON.WATER_TYPE:
                return this.typeFrames[1];
            case POKEMON.GRASS_TYPE:
                return this.typeFrames[2];
            case POKEMON.ELECTRIC_TYPE:
                return this.typeFrames[3];
            default: 
                return this.typeFrames[this.typeFrames.length];
        }
    },
    _loadSpriteFrameForCardImg: function(smallCardUrl, failedSF){
       
        cc.resources.load(smallCardUrl, cc.SpriteFrame, function(err, loadedSpriteFrame){
            if(!err){
                this.cardImg.spriteFrame = loadedSpriteFrame;
                cc.log("[LOAD_IMG_FOR_SMALL_CARD][SUCCESS]", smallCardUrl);
            }else{
                this.cardImg.spriteFrame = failedSF;
                cc.log("[LOAD_IMG_FOR_SMALL_CARD][FAILED]", smallCardUrl);
            }
        }.bind(this))
    },
    //Listeners
    onTouchCardStart: function(touchEvent){
        //cc.log("TOUCH_SMALL_CARD_START", this.idxInHand);
        //Show card name
        this.cardTitleText.enabled = true;
        this._oldPos = this.node.position;
        //var endPos = this.node.position.add(cc.v2(0, 1).mul(80));
        this.node.position =  this.node.parent.convertToNodeSpaceAR(touchEvent.getLocation());
        //Fly up Node
        // cc.tween(this.node)
        //     .to(0.1, {position: endPos}).start();
        return false;
    },
    onTouchCardEnd: function(touchEvent){
        if(!this._isDroppable){
            this.node.position = this._oldPos;
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
            return;
        }
        //Fly up Node
        // cc.tween(this.node)
        //     .to(0.1, {position: this._oldPos}).call(function(){cc.log("backPos1");this._isDroppable = true;}.bind(this)).start();
        //Hide card name
        this.cardTitleText.enabled = false;
        var localPosOfTouch = this.dropChecker.convertToNodeSpaceAR(touchEvent.getLocation());

        if(localPosOfTouch.y > 0 && localPosOfTouch.y < this.dropChecker.height){
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
            this.onDrop();
        }
        else
        {
            //When drop card outside drop area
            this.node.position = this._oldPos;
        }
    },
    onTouchCardCancel: function(touchEvent){
        if(!this._isDroppable){
            this.node.position = this._oldPos;
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
            return;
        }
        //Fly up Node
        //cc.tween(this.node)
        //    .to(0.1, {position: this._oldPos}).call(function(){cc.log("backPos2");this._isDroppable = true;}.bind(this)).start();
        this.cardTitleText.enabled = false;
        var localPosOfTouch = this.dropChecker.convertToNodeSpaceAR(touchEvent.getLocation());

        if(localPosOfTouch.y > 0 && localPosOfTouch.y < this.dropChecker.height){    
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
            this.onDrop();
        }  
        else
        {
            //When drop card outside drop area
            this.node.position = this._oldPos;
        }
    },
    onTouchCardMove: function(touchEvent){
        var delta = touchEvent.getDelta();
        this.node.x = this.node.x + delta.x;
        this.node.y = this.node.y + delta.y;
        var touchLoc = touchEvent.getLocation();
        var localPosOfTouch = this.dropChecker.convertToNodeSpaceAR(touchEvent.getLocation());
        //cc.log("touch_card_move",touchLoc.x,touchLoc.y);
        if(localPosOfTouch.y > 0 && localPosOfTouch.y < this.dropChecker.height){
            this.dropChecker.getComponent("CardDropChecker").onSelected();
        }else{
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
        }
       
    },
    onCanDropChanged: function(event){
        //cc.log("small_Card_drop",this.idxInHand, JSON.stringify(event));
        if(event.id == this.owner.getId())
            this._isDroppable = event.enabled;
    },
    onDrop: function(){
        //this.node.active = false;
        this.node.active=false;
        this.handUI.onDropCard(this.idxInHand);
    },
    backOldPosition: function(){
        this.node.position = this._oldPos;
    }
    
});
