cc.Class({
    extends: cc.Component,

    properties: {
        selectIndicator: cc.Node,
        dropCheckerNode: cc.Node,
        holderNode: cc.Node,
        energyLayoutNode: cc.Node
    },
    init: function (gm, holderType) {
        this.gm = gm;
        this._type = holderType;
        this._card = {};
        this._card[CONST.CARD.CAT.PKM] = [];
        this._card[CONST.CARD.CAT.ENERGY] = {};
        this._dmgCounter = 0;

        //
        if (this.energyLayoutNode)
            this._layout = this.energyLayoutNode.getComponent(cc.Layout);
    },
    addCard: function (cardId) {
        //Add data
        var cardData = JARVIS.getCardData(cardId);
        switch (cardData.category) {
            case CONST.CARD.CAT.PKM: {
                this._card[CONST.CARD.CAT.PKM].push(cardId);
                this._playTurn = this.gm.getTurnCount();
                break;
            }
            case CONST.CARD.CAT.ENERGY: {
                for (var energyKey in cardData.energy) {
                    if (this._card[CONST.CARD.CAT.ENERGY][energyKey] == undefined)
                        this._card[CONST.CARD.CAT.ENERGY][energyKey] = cardData.energy[energyKey];
                    else
                        this._card[CONST.CARD.CAT.ENERGY][energyKey] += cardData.energy[energyKey];

                }
                break;
            }
        }
    },
    doShowDropPokemonCard: function (cardId, cardNode) {
        cc.log("DO_SHOW_DROP");
        const moving_time = 0.5;
        var cardData = JARVIS.getCardData(cardId);
        cardNode.position = Utils.getLocalPosition(cardNode, this.holderNode);
        cardNode.removeFromParent();
        this.holderNode.addChild(cardNode);
        if (this._type == BOARD.ACTIVE_PLACE) {
            cc.tween(cardNode)
                .to(moving_time,
                    {
                        position: cc.v2(0, 0),
                        scale: 2.25
                    }).start();
            cc.tween(cc.find("Mask/Img", cardNode))
                .to(moving_time,
                    {
                        scale: cardData.card.image.transformActive.scale,
                        x: cardData.card.image.transformActive.x,
                        y: cardData.card.image.transformActive.y,

                    }).start();
            cardNode.getChildByName("EvolutionIcon").scale = 0.7;
            cardNode.getChildByName("Type").scale = 0.7;

        }
        else if (this._type == BOARD.BENCH) {
            cc.tween(cardNode)
                .to(moving_time,
                    {
                        position: cc.v2(0, 0),
                        scale: 1
                    }).start();
        }

        //cc.tween(cardNode.getChildByName("EvolutionIcon")).to(moving_time,{scale: 0.7}).start();
        //cc.tween(cardNode.getChildByName("Type")).to(moving_time,{scale: 0.7}).start();

    },
    doShowAttachEnergy: function (cardId, cardNode) {
        cc.log("DO_SHOW_ATTACH");
        //var cardData = JARVIS.getCardData(cardId);

        var startPos = Utils.getLocalPosition(cardNode, this._layout.node); // <- START_POS
        cardNode.width = this._type == BOARD.ACTIVE_PLACE ? 50 : 30;
        cardNode.height = this._type == BOARD.ACTIVE_PLACE ? 50 : 30;
        //this.layout.type = cc.Layout.HorizontalDirection;
        this._layout.type = cc.Layout.Type.HORIZONTAL; //TODO: DELETE

        cc.log("TEST_POS_1", cardNode.x, cardNode.y, cardNode.parent.name);
        cardNode.removeFromParent();
        this._layout.node.addChild(cardNode);
        this._layout.updateLayout();

        cc.log("TEST_POS_2", cardNode.x, cardNode.y, cardNode.parent.name);


        var endPos = cardNode.position;
        endPos.y = 0;

        this._layout.type = cc.Layout.Type.NONE;

        cardNode.position = startPos;
        const moving_time = 0.5;
        if (this._type == BOARD.ACTIVE_PLACE) {
            cc.tween(cardNode)
                .to(moving_time,
                    {
                        position: endPos,
                        //scale: 1/3
                    }).start();

            cc.tween(cc.find("Mask/Img", cardNode))
                .to(moving_time,
                    {
                        scale: 0.15,
                        //x: cardData.card.image.transformActive.x,
                        //y: cardData.card.image.transformActive.y,

                    }).start();
            //cardNode.getChildByName("EvolutionIcon").scale = 0.7;
            //cardNode.getChildByName("Type").scale = 0.7;
        }
        else if (this._type == BOARD.BENCH) {
            cc.tween(cardNode)
                .to(moving_time,
                    {
                        position: endPos,
                        //scale: 1/3
                    }).start();
            cc.tween(cc.find("Mask/Img", cardNode))
                .to(moving_time,
                    {
                        scale: 0.1,
                        //x: cardData.card.image.transformActive.x,
                        //y: cardData.card.image.transformActive.y,

                    }).start();
        }

        cardNode.getChildByName("EvolutionIcon").active = false;
        cardNode.getChildByName("Type").active = false;

        //cc.tween(cardNode.getChildByName("Type")).to(moving_time,{scale: 0.7}).start();

    },
    //Selection
    enableSelector: function (enabled) {
        if (enabled) {
            this.selectIndicator.color = cc.Color.GREEN;
            Utils.doUndulating(this.selectIndicator, 0.5, this.selectIndicator.scale, this.selectIndicator.scale * 1.5);
        }
        else {
            this.selectIndicator.color = cc.Color.WHITE;
            this.selectIndicator.stopAllActions();
        }
    },
    //Check
    hasPokemon() { return this._card[CONST.CARD.CAT.PKM].length > 0; },
    isEvolvable() { return this.gm.getTurnCount() > this._playTurn && !this.gm.isFirstPlayTurn(); },
    isEvolvableTo(cardId) {
    },
    //Get
    getDropChecker() { return this.dropCheckerNode ? this.dropCheckerNode.getComponent("DropChecker") : undefined; }
});
