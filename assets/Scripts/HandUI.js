const DRAW_CONST = {
    HORIZONTAL: 1,
    NONE: 0,
    TIME_TO_HAND: 0.7,
    TIME_RENEW_POSITION: 0.5,
}
cc.Class({
    extends: cc.Component,
    properties: {
        cardTemplate: cc.Prefab,
        drawBtn: cc.Button,
        remainCardTxt: cc.Label,

        dropChecker:  cc.Node,
        
    },
    init: function(idList, player, gameManager) {
        //External ref
        this.gm = gameManager;
        this.player = player;

        this.startPoint = new cc.v2(420, -403.228);
        this.deck = idList; //List of ids
        //this.deck = [1,2,3,4,5,6,7,8,9, 10];
        //this.deck = [1,1,1,4,4,4];
        this.deck =[
           1,2,3,4,5,6,
           "energy_2","energy_3"
           ,"energy_0","energy_4","energy_1"
        ];
        //this.deck = FAKE_CARDS
        // this.deck = [];
        // for(var i=0;i<60;i++){
        //     this.deck.push(1);
        // }
        this.cardIdOnHand = [];
        this.cardUIOnHand = [];
        this.layoutComponent = this.node.getComponent(cc.Layout);
        this.smallCardInfo = {
            w: this.cardTemplate.data.width,
            h: this.cardTemplate.data.width
        },

        //Private var
        this._movingCache = [];
        //Listeners
        this.drawBtn.node.on("click", this.onClickDrawBtn, this); //TODO: DELETE

    },
    draw: function(numCard){
        //numCard = 2;
        this._processWhenHandFilled(numCard);
        this.layoutComponent.type = DRAW_CONST.HORIZONTAL; //Should replace with cc.Layout.Horizontal but cc.Layout.Horizontal = undefined
        for (var i = 0; i < numCard; i++){
            if(this.deck.length - 1 < 0 ) break;
            var startMovingPoint = cc.v2(420, 0);
            var cardId = this.deck.shift();
            var cardData = JARVIS.getCardData(cardId);

            var cardUI = cc.instantiate(this.cardTemplate);
            cardUI.getComponent("SmallCardTemplate").init(cardData, this.cardIdOnHand.length, this.dropChecker, this,cardId);
            cardUI.on(CONST.EVENT.ON_TOUCH_HOLD, this._onSmallCardHold, this);
            cardUI.on(cc.Node.EventType.TOUCH_END, this._onSmallCardUnHold, this);
            cardUI.on(cc.Node.EventType.TOUCH_CANCEL, this._onSmallCardUnHold, this);
            cardUI.on(cc.Node.EventType.TOUCH_MOVE, this._onSmallCardUnHold, this);

            this.node.addChild(cardUI);
            this.layoutComponent.updateLayout();
            var endMovingPoint = cardUI.position;
            cardUI.position = startMovingPoint;
            
            cc.tween(cardUI)
            .to(DRAW_CONST.TIME_TO_HAND,{position: endMovingPoint}).start();
           
            this.cardIdOnHand.push(cardId);
            this.cardUIOnHand.push(cardUI);
            //cc.log("JSON_TEST",JSON.stringify(this.cardIdOnHand));
        }
      
        while(this._movingCache.length > 0){
            var movingData= this._movingCache.pop();
            movingData.cardUI.position = movingData.start;
            cc.tween(movingData.cardUI)
            .to(DRAW_CONST.TIME_TO_HAND,{position: movingData.end}).start();
           }   
        
        this.layoutComponent.type = cc.Layout.NONE;
        this.remainCardTxt.string = this.deck.length; 
    },

    //Private Utils
    _processWhenHandFilled: function(drawNum){ 
        if (drawNum > this.deck.length) drawNum = this.deck.length;
        var cardW = this.smallCardInfo.w;
        var numCard = this.cardIdOnHand.length + drawNum;
        var spacingX = this.layoutComponent.spacingX;
        var delta = ((cardW + spacingX) *numCard -  spacingX) - this.node.width; 

        if(delta > 0){//Neu size Hand khong chua du bai
            this.layoutComponent.spacingX = (this.node.width - cardW * numCard) / (numCard - 1);
            this.layoutComponent.type = DRAW_CONST.HORIZONTAL; //Should replace with cc.Layout.Horizontal but cc.Layout.Horizontal = undefined
            for (var i = 0; i< this.cardUIOnHand.length; i++){
                var movingData = {};
                movingData.cardUI = this.cardUIOnHand[i];
                movingData.start = this.cardUIOnHand[i].position;
                this._movingCache.push(movingData);
            }
            this.layoutComponent.updateLayout();
            for (var i = 0; i< this.cardUIOnHand.length; i++){
                this._movingCache[i].end = this.cardUIOnHand[i].position;
            }
        }
    },
    _getDifferentialCards: function(){

    },
    
    //Listeners
    onClickDrawBtn: function(){
        //cc.log("Draw_Card",RES_MGR.getRes("SmallPokemon/003"));
        //this.gm.testNode.spriteFrame = RES_MGR.getRes("SmallPokemon/003");
        //this.node.y = this.node.y + 100;
        this.draw(1);
    },
    //Reset position when drop 1 card
    resetCardPosOnDrop: function(droppedCardIdx){
        cc.log('resetCardPos',droppedCardIdx,this.cardUIOnHand.length);
        // if(DroppedCardIdx == undefined){
        //     DroppedCardIdx = this.cardUIOnHand.length;
        // }
        this.layoutComponent.type = DRAW_CONST.HORIZONTAL; //Should replace with cc.Layout.Horizontal but cc.Layout.Horizontal = undefined
        this.layoutComponent.paddingLeft = 0.10 * cc.winSize.width;
        this.layoutComponent.paddingRight = 0.10 * cc.winSize.width;
        this.layoutComponent.updateLayout(); //TODO: should use new position of layout updated

        for (var i = droppedCardIdx; i < this.cardUIOnHand.length; i++){
            var cardUI = this.cardUIOnHand[i];
            var cardUIScr  = cardUI.getComponent("SmallCardTemplate");
            //Update idx in hand
            cardUIScr.idxInHand = i;
            //var startMovingPoint = cardUI.position;
            
            //cc.log("ON_CARD_APPROVED4", cardUI.position.x);

            //endMovingPoint = cardUI.position;

            //var endMovingPoint = cardUI.position.sub(cc.v2(this.smallCardInfo.w + this.layoutComponent.spacingX, 0));
            // cc.tween(cardUI)
            // .to(0.5,{position: endMovingPoint}).start();

            //cc.log("reset_card", cardUIScr.idxInHand, cardUIScr.cardId);
        }
        this.layoutComponent.type = cc.Layout.NONE;
      
    },
    resetCardPos: function(){
        this.layoutComponent.type = DRAW_CONST.HORIZONTAL;
        this.layoutComponent.updateLayout();
        this.layoutComponent.type = cc.Layout.NONE;
    },
   
    onDropCard: function(idx){
        var cardId = this.cardIdOnHand[idx];
        var cardUI = this.cardUIOnHand[idx];
        this.dropCardUI = cardUI;
        this.dropCardId = cardId;
        this.idxDropCard = idx;
        //cc.log("HAND_DROP", idx, cardId, this.cardIdOnHand, this.cardUIOnHand);
        this.gm.onDropCard(cardId);
    },
    onDropCardCancel: function(){
        this.dropCardUI.active = true;
        this.dropCardUI.getComponent("SmallCardTemplate").backOldPosition();
        this.dropCardUI = null;
        this.dropCardId = null;
        this.resetCardPos();
    },
    onDropCardApproved: function(){
        this.node.removeChild(this.cardUIOnHand[this.idxDropCard]);
        this.cardUIOnHand.splice(this.idxDropCard, 1);
        this.cardIdOnHand.splice(this.idxDropCard, 1);
        this.dropCardUI = null;
        this.dropCardId = null;
        this.resetCardPosOnDrop(this.idxDropCard);

    },
    _onSmallCardHold: function(cardId){
        var topUI = this.gm.getTopUI().getComponent("TopUI");
        topUI.showPokemonCardInfo(cardId, true);
    },
    _onSmallCardUnHold: function(){
        var topUI = this.gm.getTopUI().getComponent("TopUI");
        topUI.showPokemonCardInfo(undefined, false);
    },
    //Check
    hasBasicPkm: function(){
        for (var cardId of this.cardIdOnHand){
            var cardData = JARVIS.getCardData(cardId);
            if(cardData.stage == 0 || cardData.stage == 1 || cardData.stage == undefined ) return true; 
        }
        return false;
    }
});
