const DRAW_CONST = {
    HORIZONTAL: 1,
    NONE: 0,
    TIME_TO_HAND: 0.6,
    TIME_RENEW_POSITION: 0.5,
}
cc.Class({
    extends: cc.Component,
    properties: {
        //Template
        cardTemplate: cc.Prefab,
        sleeveTemplate: cc.Prefab,

        //Btn for test
        drawBtn: cc.Button,

        //Deck
        deckIcon: cc.Node,
        remainCardTxt: cc.Label,

        //Drop checker
        dropChecker: cc.Node
    },
    init: function (player, gameManager) {
        //External ref


        this.gm = gameManager;
        this.board = this.gm.getBoard();
        this.player = player;
        //Variables
        this.LOG_TAG = "[HAND_UI]";
        //FOR FAKE DATA
        this.deck = [];

        var rando = [
            1, 2, 3,
            4, 5, 6,
            7, 8, 9,
            //"energy_2", "energy_3", "energy_4"
        ];
        this.deck = rando;
        var n = 59;
        for (var i = 0; i < n; i++) {

            var randi = Math.floor(Math.random() * rando.length);
            //cc.log("INIT_DECK_", player.getId(), i, rando[randi]);
            this.deck.push(rando[randi]);
        }
        this.deck.splice(Math.floor(Math.random() * 5), 0, [1, 4, 7][Math.floor(Math.random() * 3)]);
        //----------------

        this.cardIdOnHand = [];
        this.cardUIOnHand = [];
        this._movingCache = [];

        this.layoutComponent = this.node.getComponent(cc.Layout);
        this.smallCardInfo = {
            w: this.cardTemplate.data.width,
            h: this.cardTemplate.data.height
        };

        this.drawBtn.node.on("click", this.onClickDrawBtn, this); //TODO: DELETE
    },
    _modifySpacingX: function (numDrawCard) {
        //Dieu chinh spacing X neu kich thuoc HandUI vuot qua screen width
        if (numDrawCard == undefined) numDrawCard = 0;
        if (numDrawCard > this.deck.length) numDrawCard = this.deck.length;
        var cardW = this.smallCardInfo.w;
        var numCard = this.cardIdOnHand.length + numDrawCard;
        var spacingX = 0;
        var delta = ((cardW + spacingX) * numCard - spacingX) - (cc.winSize.width / 2 - 20); //TODO: REPLACE: (cc.winSize.width/2 - 20) -> (cc.winSize.width - 20)
        if (delta > 0) {//Neu size Hand khong chua du bai
            this.layoutComponent.spacingX = (cc.winSize.width / 2 - 20 - cardW * numCard) / (numCard - 1); //TODO: cc.winSize.width/2 -20  -> cc.winSize.width -20
            return true;
        }
        else {
            this.layoutComponent.spacingX = 0;
        }
        return false;
    },
    draw(drawList, blind, numDraw) {
        cc.log("DRAW_CLIENT", this.gm.clientId, blind);
        //numDrawCard = numDrawCard > this.deck.length ? this.deck.length : numDrawCard;
        var numDrawCard = numDraw == undefined ? drawList.length : numDraw;

        this._movingCache = [];
        this._modifySpacingX(numDrawCard);
        this.layoutComponent.type = DRAW_CONST.HORIZONTAL; //Should replace with cc.Layout.Horizontal but cc.Layout.Horizontal = undefined
        var totalLen = this.cardIdOnHand.length + numDrawCard;
        //Init new cards and attach them to hand
        var cardId, cardData, cardUI;
        for (var i = 0; i < totalLen; i++) {
            var movingData = {};
            if (i >= totalLen - numDrawCard) {
                if (!blind) {
                    cardId = drawList.shift();
                    cardData = JARVIS.getCardData(cardId);
                    cardUI = cc.instantiate(this.cardTemplate);

                    var card = cardUI.getComponent("BasicCard");
                    card.setIdx(this.cardIdOnHand.length);
                    card.init(this.gm.getClientId(), cardData);
                    this.addDragAndDrop(card);

                    this.cardIdOnHand.push(cardId);
                    this.cardUIOnHand.push(cardUI);
                }
                else {
                    cardUI = cc.instantiate(this.sleeveTemplate);
                    this.cardUIOnHand.push(cardUI);
                }

                this.node.addChild(cardUI);


                movingData.start = Utils.getLocalPosition(this.deckIcon, this.node); //Start moving point
                const delay = 0.1;
                movingData.delay = (i - (totalLen - numDrawCard)) * delay;
            }
            else {
                movingData.start = this.cardUIOnHand[i].position;
                movingData.delay = 0;

            }

            this._movingCache.push(movingData);

            //cc.log("JSON_TEST",JSON.stringify(this.cardIdOnHand));
        }

        this.layoutComponent.updateLayout();

        for (var i = 0; i < totalLen; i++) {
            var cardUI = this.cardUIOnHand[i];
            var movingData = this._movingCache[i];
            var endPosition = cardUI.position;
            endPosition.y = 0;
            cardUI.position = movingData.start;

            t1 = cc.tween(cardUI)
                .delay(movingData.delay)
                .to(DRAW_CONST.TIME_TO_HAND, { position: endPosition });
            if (i == totalLen - 1) {
                t1.call(this.onActionFinish.bind(this)).start();
            }
            else {
                t1.start();
            }
        }

        this.layoutComponent.type = cc.Layout.NONE;
        this.remainCardTxt.string = this.deck.length;
    },
    onDropCardStart: function () {
        this._dropCard.node.getComponent(cc.BoxCollider).enabled = false;
        this.board.playerDropCard(this._dropCard.getCardId(), this._dropCard.node, this._dropCard.dropPlace, this._dropCard.benchIdx);
        this.cardIdOnHand.splice(this._dropCard.getIdx(), 1);
        this.cardUIOnHand.splice(this._dropCard.getIdx(), 1);
        this.resetCardPosOnDrop(this._dropCard.getIdx());
    },
    onDropCardCancel: function () {
        this.board.enableSelect(false);
        this._dropCard.node.position = this._dropCard.oldPos;
        this._dropCard.node.getComponent(cc.BoxCollider).enabled = false; //Enabled Collider
    },
    //Reset position when drop 1 card
    resetCardPosOnDrop: function (droppedCardIdx) {
        // if(DroppedCardIdx == undefined){
        //     DroppedCardIdx = this.cardUIOnHand.length;
        // }
        this._modifySpacingX();
        this.layoutComponent.type = DRAW_CONST.HORIZONTAL; //Should replace with cc.Layout.Horizontal but cc.Layout.Horizontal = undefined
        this.layoutComponent.updateLayout(); //TODO: should use new position of layout updated

        for (var i = droppedCardIdx; i < this.cardUIOnHand.length; i++) {
            var cardUI = this.cardUIOnHand[i];
            
            var card = cardUI.getComponent("BasicCard");
            if(card) card.setIdx(i);

        }
        this.layoutComponent.type = cc.Layout.NONE;

    },

    //Listeners
    addDragAndDrop: function (card) {
        var collider = card.node.getComponent(cc.BoxCollider);
        collider.tag = COLLIDER_TAG.CARD;
        collider.enabled = false;
        card.node.on(cc.Node.EventType.TOUCH_START, this.onCardTouchStart.bind(card, this));
        card.node.on(cc.Node.EventType.TOUCH_MOVE, this.onCardTouchMove.bind(card, this));
        card.node.on(cc.Node.EventType.TOUCH_END, this.onCardTouchEnded.bind(card, this));
        card.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onCardTouchEnded.bind(card, this));
    },
    onCardTouchStart: function (hand, touchEvent) { //This == basic card component
        cc.log("TOUCH_START", this.getIdx());
        this.isTouched = true;
        this.canDrop = false;
        this.oldPos = this.node.position;
        this.node.getComponent(cc.BoxCollider).enabled = true; //Enabled Collider

        hand._dropCard = this;
        hand.gm.showSelectable(this.getCardId());
        

    },
    onCardTouchMove: function (hand, touchEvent) { //This == basic card component
        //cc.log("TOUCH_MOVE", this.getIdx());
        if (!this.isTouched) return;
        var delta = touchEvent.getDelta();
        this.node.x = this.node.x + delta.x;
        this.node.y = this.node.y + delta.y;
    },
    onCardTouchEnded: function (hand, touchEvent) {
        // var localPosOfTouch = this.dropChecker.convertToNodeSpaceAR(touchEvent.getLocation());
        cc.log("TOUCH_END",this.canDrop);

        if (this.canDrop) {
            hand.onDropCardStart();
        }
        else {
            hand.onDropCardCancel();
        }
    },


    onActionFinish: function () {
        this.gm.node.emit(CONST.ACTION.EVENT.ON_FINISH);
    },
    onClickDrawBtn: function () {
        cc.log("DRAW");
        this.gm.noti("HELLO WORLD 123", 2);
        //this.draw(["1", "2", "3"], false);
    },
    //UTILS
    createNewNode: function(cardId){
        cardUI = cc.instantiate(this.cardTemplate);
        var card = cardUI.getComponent("BasicCard");
        card.init(this.gm.getClientId(), JARVIS.getCardData(cardId));
        return cardUI;
    },
    replaceCard: function(cardId, idx){
        this.cardIdOnHand.splice(idx , 1);
        var removedCard = this.cardUIOnHand.splice(idx , 1)[0];
        var newCardNode = this.createNewNode(cardId);
        
        this.node.addChild(newCardNode);
        newCardNode.position = removedCard.position;
        newCardNode.zIndex = removedCard.zIndex;
        this.node.removeChild(removedCard);
        removedCard.destroy();
        this.layoutComponent.updateLayout();
        return newCardNode;
    },
    removeCardNode: function(idx){
        this.cardIdOnHand.splice(idx , 1);
        return this.cardUIOnHand.splice(idx , 1);
    },
    //GET
    getCardNode: function(idx){
        return this.cardUIOnHand[idx];
    },
    
});
