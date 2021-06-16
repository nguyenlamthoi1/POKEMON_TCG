cc.Class({
    extends: cc.Component,

    properties: {
        //Sprite
        background: cc.Sprite,
        img: cc.Sprite,
        frame: cc.Sprite,
        type: cc.Sprite,
        //Label
        stageTxt: cc.Label,
        //Node
        evolutionIcon: cc.Node,
        //SF
        frameSF: [cc.SpriteFrame],
        typeSF: [cc.SpriteFrame],
    },
    init: function (clientId, cardData) {
        cc.log("READ_DATA", JSON.stringify(cardData));

        this.type.spriteFrame = this._getTypeSF(cardData.type); //LOAD TYPE
        this.evolutionIcon.active = cardData.stage > 0; //LOAD EVOLUTION
        this.stageTxt.string = cardData.stage;
        //Set image
        this.img.spriteFrame = RES_MGR[clientId].getRes(cardData.card.image.url);
        this.img.node.x = cardData.card.image.transform.x;
        this.img.node.y = cardData.card.image.transform.y;
        this.img.node.scale = cardData.card.image.transform.scale;
        //Set background
        this.background.spriteFrame = RES_MGR[clientId].getRes(cardData.card.background.url);
        this.background.node.x = cardData.card.background.transform.x;
        this.background.node.y = cardData.card.background.transform.y;
        this.background.node.scale = cardData.card.background.transform.scale;
        //Set frame
        //this.frame.spriteFrame = this._getFrameSF(cardData); //LOAD FRAME
        this.frame.spriteFrame = RES_MGR[clientId].getRes(cardData.card.frame.url);
        this.frame.node.x = cardData.card.frame.transform.x;
        this.frame.node.y = cardData.card.frame.transform.y;
        this.frame.node.scale = cardData.card.frame.transform.scale;

    },
    _getFrameSF: function (cardData) {
        if (cardData.category == CONST.CARD.CAT.PKM) {
            switch (cardData.type[0]) {
                case POKEMON.FIRE_TYPE:
                    return this.frameSF[0];
                case POKEMON.WATER_TYPE:
                    return this.frameSF[1];
                case POKEMON.GRASS_TYPE:
                    cc.log("abc");
                    return this.frameSF[2];
                default:
                    return this.frameSF[this.frameSF.length - 1];
            }
        }
        if (this.category == CONST.CARD.CAT.ENERGY) {
            switch (type) {
                case CONST.ENERGY.FIRE:
                    return this.frameSF[0];
                case CONST.ENERGY.WATER:
                    return this.frameSF[1];
                case CONST.ENERGY.GRASS:
                    return this.frameSF[2];
                default:
                    return this.frameSF[this.frameSF.length - 1];
            }
        }
    },
    _getTypeSF: function (type) {
        switch (type[0]) {
            case POKEMON.FIRE_TYPE:
                return this.typeSF[0];
            case POKEMON.WATER_TYPE:
                return this.typeSF[1];
            case POKEMON.GRASS_TYPE:
                return this.typeSF[2];
            default:
                return this.typeSF[this.typeSF.length - 1];
        }
    },

});
