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
    },
    init: function (player, gameManager) {
        //External ref


        this.gm = gameManager;
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
        if(numDrawCard == undefined) numDrawCard = 0;
        if (numDrawCard > this.deck.length) numDrawCard = this.deck.length;
        var cardW = this.smallCardInfo.w;
        var numCard = this.cardIdOnHand.length + numDrawCard;
        var spacingX = 0;
        var delta = ((cardW + spacingX) * numCard - spacingX) - (cc.winSize.width/2 - 20); //TODO: REPLACE: (cc.winSize.width/2 - 20) -> (cc.winSize.width - 20)
        if (delta > 0) {//Neu size Hand khong chua du bai
            this.layoutComponent.spacingX = (cc.winSize.width/2 - 20 - cardW * numCard) / (numCard - 1); //TODO: cc.winSize.width/2 -20  -> cc.winSize.width -20
            return true;
        }
        else {
            this.layoutComponent.spacingX = 0;
        }
        return false;

    },
    draw: function (drawList, blind) {
        
        //numDrawCard = numDrawCard > this.deck.length ? this.deck.length : numDrawCard;
        var numDrawCard = drawList.length;

        this._movingCache = [];
        this._modifySpacingX(numDrawCard);
        this.layoutComponent.type = DRAW_CONST.HORIZONTAL; //Should replace with cc.Layout.Horizontal but cc.Layout.Horizontal = undefined
        var totalLen = this.cardIdOnHand.length + numDrawCard;
        //Init new cards and attach them to hand
        var cardId, cardData, cardUI;
        for (var i = 0; i < totalLen; i++) {
            var movingData = {};
            if (i >= totalLen - numDrawCard) {
                if(!blind){
                    cardId = this.drawList.shift();
                    cardData = JARVIS.getCardData(cardId);
                    cardUI = cc.instantiate(this.cardTemplate);
                    cardUI.getComponent("BasicCard").init(cardData);
                    this.cardIdOnHand.push(cardId);
                    this.cardUIOnHand.push(cardUI);
                }
                else{
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

            cc.tween(cardUI)
                .delay(movingData.delay)
                .to(DRAW_CONST.TIME_TO_HAND, { position: endPosition }).start();
        }

        this.layoutComponent.type = cc.Layout.NONE;
        this.remainCardTxt.string = this.deck.length;
    },


    //Listeners
    onClickDrawBtn: function () {
        this.draw(["1","2","3"], false);
    }

});
