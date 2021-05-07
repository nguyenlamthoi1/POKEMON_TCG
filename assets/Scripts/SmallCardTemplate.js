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
        failedImg: cc.SpriteFrame
       
    },
    init: function(data, idxInHand, dropChecker, handUI){
        cc.log("INIT_CARD",JSON.stringify(data));
        this.handUI = handUI;
        this.owner = handUI.player;
        this.dropChecker = dropChecker;
        this.idxInHand = idxInHand;
        this.data = data;
        //Card name
        this.cardTitleText.string = data.name;
        this.cardTitleText.enabled = false;


        this.cardTitleText.node.color = this._getColorTxt(data.type);
        this.cardTypeText.string = data.category;
        this.cardContainer.spriteFrame = this._getCardFrame(data.type);

        this.cardImg.spriteFrame = this.failedImg; //Load dymanically
        this._loadSpriteFrameForCardImg(data.smallCardUrl);

        //Evolution info
        this.evolutionIcon.node.active = data.evolution > 1;
        this.evolutionTxt.string = data.evolution - 1;
        //Type PKM info: fire, water,..
        for(var i = 0; i < this.types.length; i ++)  this.types[i].active = false;
        for (var typeKey in data.type) { 
            this.types[typeKey].active = true;
            this.types[typeKey].getComponent(cc.Sprite).spriteFrame = this._getTypeFrame(data.type[typeKey]);
        }
        
        //Listeners
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchCardStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchCardEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCardCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchCardMove, this);
        this.handUI.player.registerEvent("droppable-changed-true", this.onCanDropChanged, this);
        this._isTouchable = this.handUI.player.isDropEnabled();
    },
    _getCardFrame: function(type){
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
                return this.cardFrames[this.cardFrames.length];
        }
    },
    _getColorTxt: function(type){
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
                return this.colorTxt[this.colorTxt.length];
        }
    },
    _getTypeFrame: function(type){
        cc.log("test_Type", type);
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
    _loadSpriteFrameForCardImg: function(smallCardUrl){
        cc.log("load_res", smallCardUrl);
        cc.resources.load(smallCardUrl, cc.SpriteFrame, function(err, loadedSpriteFrame){
            if(!err){
                this.cardImg.spriteFrame = loadedSpriteFrame;
                cc.log("IMG_LOAD_SUC");
            }else{
                cc.log("IMG_LOAD_FAIL");

            }
        }.bind(this))
    },
    //Listeners
    onTouchCardStart: function(touchEvent){
        //cc.log("TOUCH_SMALL_CARD_START", this.idxInHand);
        if(!this._isTouchable) return;
        //Show card name
        this.cardTitleText.enabled = true;
        //if(!this._isTouchable) return;
        this._oldPos = this.node.position;
        //this._isTouchable = false;
       

        var endPos = this.node.position.add(cc.v2(0, 1).mul(80));
        cc.log("TouchCard", endPos.x , endPos.y);
        this.node.position = endPos;
        //Fly up Node
        // cc.tween(this.node)
        //     .to(0.1, {position: endPos}).start();
        return false;
    },
    onTouchCardEnd: function(touchEvent){
        if(!this._isTouchable) return;
        //cc.log("touch_card_end", this.idxInHand);
        this.node.position = this._oldPos;
        //cc.log("EndTouch", this._oldPos.x,this._oldPos.y);
        //Fly up Node
        // cc.tween(this.node)
        //     .to(0.1, {position: this._oldPos}).call(function(){cc.log("backPos1");this._isTouchable = true;}.bind(this)).start();
        //Hide card name
        this.cardTitleText.enabled = false;
        var localPosOfTouch = this.dropChecker.convertToNodeSpaceAR(touchEvent.getLocation());

        if(localPosOfTouch.y > 0 && localPosOfTouch.y < this.dropChecker.height){
            //cc.log("DropCard");
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
            this.onDrop();
        }
    },
    onTouchCardCancel: function(touchEvent){
        if(!this._isTouchable) return;
       // cc.log("touch_card_cancel", this.idxInHand);
        this.node.position = this._oldPos;

        //cc.log("EndTouch", this._oldPos.x,this._oldPos.y);
        //Fly up Node
        //cc.tween(this.node)
        //    .to(0.1, {position: this._oldPos}).call(function(){cc.log("backPos2");this._isTouchable = true;}.bind(this)).start();
        this.cardTitleText.enabled = false;
        var localPosOfTouch = this.dropChecker.convertToNodeSpaceAR(touchEvent.getLocation());

        if(localPosOfTouch.y > 0 && localPosOfTouch.y < this.dropChecker.height){
            cc.log("DropCard");
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
            this.onDrop();
        }
    },
    onTouchCardMove: function(touchEvent){
        if(!this._isTouchable) return;
        var delta = touchEvent.getDelta();
        this.node.x = this.node.x + delta.x;
        this.node.y = this.node.y + delta.y;
        var touchLoc = touchEvent.getLocation();
        //var dropCheckerPos = this.dropChecker.position;
        //var dropCheckerWPos=  this.dropChecker.parent.convertToWorldSpaceAR(dropCheckerPos);
        var localPosOfTouch = this.dropChecker.convertToNodeSpaceAR(touchEvent.getLocation());
        //cc.log("touch_card_move", this.dropChecker.width, this.dropChecker.y,localPosOfTouch.x,localPosOfTouch.y);
        if(localPosOfTouch.y > 0 && localPosOfTouch.y < this.dropChecker.height){
            this.dropChecker.getComponent("CardDropChecker").onSelected();
        }else{
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
        }
       
    },
    onCanDropChanged: function(event){
        cc.log("small_Card_drop", JSON.stringify(event));
        if(event.id == this.owner.getId())
            this._isTouchable = event.enabled;
    },
    onDrop: function(){
        //this.node.active = false;
        this.node.active=false;
        this.handUI.onDropCard(this.idxInHand);
    },
    
});
