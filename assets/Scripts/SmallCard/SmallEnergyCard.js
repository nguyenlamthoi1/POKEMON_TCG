cc.Class({
    extends: cc.Component,

    properties: {
        //Card UI
        cardFrame: cc.Sprite,
        cardBackground: cc.Sprite,
        cardImg: cc.Sprite,
        //Labels
        cardTitle: cc.Label,
        stackNum: cc.Label,
        //Other
        energyPanel: cc.Node,
        energyIcon: [cc.Sprite],
        //SF
        cardFrameSF: [cc.SpriteFrame],
        cardSmallBgSF: [cc.SpriteFrame],
        cardImgSF: [cc.SpriteFrame],
    },
    init: function (data, idxInHand, dropChecker, handUI, cardId, haveListeners) {
        cc.log("INIT_CARD_ENERGY", idxInHand, cardId, this.idxInHand,JSON.stringify(data));
        this._cardId = cardId;
        if(this.handUI){
            this._handUI = handUI;
            this._owner = handUI.player;
        }
       
        this._data = data;
        this._category = data.category;

        this.dropChecker = dropChecker;
        this.idxInHand = idxInHand;

        this._initEnergyCard(data);

        //Listeners
        if(haveListeners){
            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchCardStart, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchCardEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCardCancel, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchCardMove, this);
            //this.node.on(CONST.EVENT.ON_TOUCH_HOLD, this.onTouchHold, this);
            this._handUI.player.registerEvent("droppable-changed", this.onCanDropChanged, this);
            this._isDroppable = this._handUI.player.isDropEnabled();
        }
    },
    _initEnergyCard: function (data) {
        cc.log("INIT_ENERGY_CARD", JSON.stringify(data));
        //Card name
        this.cardTitle.string = data.name;
        this.cardTitle.enabled = true;
        //Card Frame
        this.cardFrame.spriteFrame = this._getCardFrameSF(data.energyType);
        //Small background
        this.cardBackground.spriteFrame = this._getSmallBgSF(data.energyType);
        //Load energy
        //this.cardImg.node.scale = data.smallScale ? data.smallScale : 1;
        this.cardImg.spriteFrame = this._getCardImgSF(data.energyType);
        //Type PKM info: fire, water,..
        for (var energy of this.energyIcon) energy.node.active = false;
        for (var energyKey in data.energy) {
            for(var i = 0; i < data.energy[energyKey]; i++){
                var foundEnergySprite = undefined;
                for (var energyIcon of this.energyIcon) {
                    if (!energyIcon.node.active) {
                        foundEnergySprite = energyIcon;
                        break;
                    }
                }
                if (!foundEnergySprite) {//Not found free Energy Icon
                    foundEnergySprite = cc.instantiate(this.energyIcon[0].node).getComponent(cc.Sprite);
                    this.energyIcon.push(foundEnergySprite);
                    this.energyPanel.addChild(foundEnergySprite.node);
                }
                foundEnergySprite.node.active = true;
                foundEnergySprite.spriteFrame = this._getCardImgSF(energyKey);
            } 
        }
        this.stackNum.string = 1;
    },
    _getCardImgSF:  function (type) {
        switch (type) {
            case CONST.ENERGY.FIRE:
                return this.cardImgSF[0];
            case CONST.ENERGY.WATER:
                return this.cardImgSF[1];
            case CONST.ENERGY.GRASS:
                return this.cardImgSF[2];
            case CONST.ENERGY.ELECTRIC:
                return this.cardImgSF[3];
            case CONST.ENERGY.NORMAL:
                return this.cardImgSF[4];
            default:
                return this.cardImgSF[this.colorTxt.length - 1];
        }
    },
    _getCardFrameSF: function (type) {
        switch (type) {
            case CONST.ENERGY.FIRE:
                return this.cardFrameSF[0];
            case CONST.ENERGY.WATER:
                return this.cardFrameSF[1];
            case CONST.ENERGY.GRASS:
                return this.cardFrameSF[2];
            case CONST.ENERGY.ELECTRIC:
                return this.cardFrameSF[3];
            case CONST.ENERGY.NORMAL:
                return this.cardFrameSF[4];
            default:
                return this.cardFrameSF[this.colorTxt.length - 1];
        }
    },
    _getSmallBgSF:  function (type) {
        switch (type) {
            case CONST.ENERGY.FIRE:
                return this.cardSmallBgSF[0];
            case CONST.ENERGY.WATER:
                return this.cardSmallBgSF[1];
            case CONST.ENERGY.GRASS:
                return this.cardSmallBgSF[2];
            case CONST.ENERGY.ELECTRIC:
                return this.cardSmallBgSF[3];
            case CONST.ENERGY.NORMAL:
                return this.cardSmallBgSF[4];
            default:
                return this.cardSmallBgSF[this.colorTxt.length - 1];
        }
    },
    //Listeners
    onTouchCardStart: function (touchEvent) {
        cc.log("TOUCH_SMALL_CARD", this.idxInHand);
        this._oldPos = this.node.position;
        //var endPos = this.node.position.add(cc.v2(0, 1).mul(80));
        this.node.position = this.node.parent.convertToNodeSpaceAR(touchEvent.getLocation());
        //Fly up Node
        // cc.tween(this.node)
        //     .to(0.1, {position: endPos}).start();
        var touch = touchEvent.touch;
        this._touchEnd = false;
        this.scheduleOnce(
            function (touch) {
                cc.log("HOLD_SMALL_CARD", JSON.stringify(touch.getDelta().mag()));
                var delta = touch.getDelta().mag();
                if (delta == 0) this.node.emit(CONST.EVENT.ON_TOUCH_HOLD, this._cardId);
            }.bind(this, touch)
            , 0.5)
        return false;
    },
    onTouchCardEnd: function (touchEvent) {
        this._touchEnd = true;
        //this.cardTitleText.enabled = false;
        if (!this._isDroppable) {
            this.node.position = this._oldPos;
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
            return;
        }
        //Fly up Node
        // cc.tween(this.node)
        //     .to(0.1, {position: this._oldPos}).call(function(){cc.log("backPos1");this._isDroppable = true;}.bind(this)).start();
        //Hide card name

        var localPosOfTouch = this.dropChecker.convertToNodeSpaceAR(touchEvent.getLocation());

        if (localPosOfTouch.y > 0 && localPosOfTouch.y < this.dropChecker.height) {
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
            this.onDrop();
        }
        else {
            //When drop card outside drop area
            this.node.position = this._oldPos;
        }
    },
    onTouchCardCancel: function (touchEvent) {
        this._touchEnd = true;
        //this.cardTitleText.enabled = false;
        if (!this._isDroppable) {
            this.node.position = this._oldPos;
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
            return;
        }
        //Fly up Node
        //cc.tween(this.node)
        //    .to(0.1, {position: this._oldPos}).call(function(){cc.log("backPos2");this._isDroppable = true;}.bind(this)).start();
        var localPosOfTouch = this.dropChecker.convertToNodeSpaceAR(touchEvent.getLocation());

        if (localPosOfTouch.y > 0 && localPosOfTouch.y < this.dropChecker.height) {
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
            this.onDrop();
        }
        else {
            //When drop card outside drop area
            this.node.position = this._oldPos;
        }
    },
    onTouchCardMove: function (touchEvent) {
        var delta = touchEvent.getDelta();
        this.node.x = this.node.x + delta.x;
        this.node.y = this.node.y + delta.y;
        var touchLoc = touchEvent.getLocation();
        var localPosOfTouch = this.dropChecker.convertToNodeSpaceAR(touchEvent.getLocation());
        //cc.log("touch_card_move",touchLoc.x,touchLoc.y);
        if (localPosOfTouch.y > 0 && localPosOfTouch.y < this.dropChecker.height) {
            this.dropChecker.getComponent("CardDropChecker").onSelected();
        } else {
            this.dropChecker.getComponent("CardDropChecker").onNotSelected();
        }

    },
    onCanDropChanged: function (event) {
        //cc.log("small_Card_drop",this.idxInHand, JSON.stringify(event));
        if (event.id == this._owner.getId())
            this._isDroppable = event.enabled;
    },
    onDrop: function () {
        //this.node.active = false;
        this.node.active = false;
        this._handUI.onDropCard(this.idxInHand);
    },
    backOldPosition: function () {
        this.node.position = this._oldPos;
    },
    getId: function(){return this._cardId;},
    setStackNumber: function(num){this.stackNum.string = num;},
    setStackNumberEnabled: function(enabled){this.stackNum.node.active = enabled;}
});