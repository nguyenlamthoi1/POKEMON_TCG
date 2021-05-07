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
        this.gameManager = gameManager;
        this.player = player;

        this.startPoint = new cc.v2(420, -403.228);
        this.deck = idList; //List of ids
        this.deck = [1,2,3,4,5,6,7,8,9, 10];
        // this.deck = [];
        // for(var i=0;i<60;i++){
        //     this.deck.push(1);
        // }
        this.cardIdOnHand = [];
        this.cardUIonHand = [];
        this.layoutComponent = this.node.getComponent(cc.Layout);
        this.smallCardInfo = {
            w: this.cardTemplate.data.width,
            h: this.cardTemplate.data.width
        },

        //Private var
        this._movingCache = [];
        //Listeners
        this.drawBtn.node.on("click", this.onClickDrawBtn, this);

    },
    draw: function(numCard){
        //numCard = 2;
        this._processWhenHandFilled(numCard);
        cc.log("test_draw");
        this.layoutComponent.type = DRAW_CONST.HORIZONTAL; //Should replace with cc.Layout.Horizontal but cc.Layout.Horizontal = undefined
        for (var i = 0; i < numCard; i++){
            if(this.deck.length - 1 < 0 ) break;
            var startMovingPoint = cc.v2(420, 0);
            var cardId = this.deck.shift();
            var cardData = JARVIS.getCardData(cardId);
            var cardUI = cc.instantiate(this.cardTemplate);
            cardUI.getComponent("SmallCardTemplate").init(cardData, this.cardIdOnHand.length, this.dropChecker, this);
            if(this.cardIdOnHand.indexOf("cardId")){

            }
            this.node.addChild(cardUI);
            this.layoutComponent.updateLayout();
            
            var endMovingPoint = cardUI.position;
            cardUI.position = startMovingPoint;
            
            cc.tween(cardUI)
            .to(DRAW_CONST.TIME_TO_HAND,{position: endMovingPoint}).start();
           
            this.cardIdOnHand.push(cardId);
            this.cardUIonHand.push(cardUI);
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
            for (var i = 0; i< this.cardUIonHand.length; i++){
                var movingData = {};
                movingData.cardUI = this.cardUIonHand[i];
                movingData.start = this.cardUIonHand[i].position;
                this._movingCache.push(movingData);
            }
            this.layoutComponent.updateLayout();
            for (var i = 0; i< this.cardUIonHand.length; i++){
                this._movingCache[i].end = this.cardUIonHand[i].position;
            }
        }
    },
    _getDifferentialCards: function(){

    },
    
    //Listeners
    onClickDrawBtn: function(){
        cc.log("Draw_Card");
        //this.node.y = this.node.y + 100;
        this.draw(1);
    },
    //Reset position when drop 1 card
    resetCardPosOnDrop: function(DroppedCardIdx){
        // if(DroppedCardIdx == undefined){
        //     DroppedCardIdx = this.cardUIonHand.length;
        // }
        this.layoutComponent.type = DRAW_CONST.HORIZONTAL; //Should replace with cc.Layout.Horizontal but cc.Layout.Horizontal = undefined

        for (var i = DroppedCardIdx; i < this.cardUIonHand.length; i++){
            var cardUI = this.cardUIonHand[i];
            //var startMovingPoint = cardUI.position;
            cc.log("test_layout_1",this.layoutComponent.paddingLeft );
            this.layoutComponent.paddingLeft = 0.10 * cc.director.getWinSize().width;
            this.layoutComponent.paddingRight = 0.10 * cc.director.getWinSize().width;

            this.layoutComponent.updateLayout(); //TODO: should use new position of layout updated
            cc.log("test_layout_2",this.layoutComponent.paddingLeft );

            //endMovingPoint = cardUI.position;

            //var endMovingPoint = cardUI.position.sub(cc.v2(this.smallCardInfo.w + this.layoutComponent.spacingX, 0));
            // cc.tween(cardUI)
            // .to(0.5,{position: endMovingPoint}).start();
            
        }
        this.layoutComponent.type = cc.Layout.NONE;
      
    },
    onDropCard: function(idx){
        //this.node.removeChild(this.cardUIonHand[idx]);
         this.cardUIonHand.splice(idx, 1);
       var dropCardId =this.cardIdOnHand.splice(idx, 1)[0];
        this.resetCardPosOnDrop(idx);
        this.gameManager.onDropCard(dropCardId);
    },
    //Check
    hasBasicPkm: function(){
        for (var cardId of this.cardIdOnHand){
            var cardData = JARVIS.getCardData(cardId);
            if(cardData.evolution == 0 || cardData.evolution == 1 || cardData.evolution == undefined ) return true; 
        }
        return false;
    }
});
