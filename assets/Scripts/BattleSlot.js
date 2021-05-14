const BATTLE_SLOT = {
    ACTIVE_TYPE: 0,
    BENCH_TYPE: 1,
    ACTIVE_SIZE: { w: 120, h: 120 },
    BENCH_SIZE: { w: 96, h: 96 },
    COLOR: {
        WHITE: cc.Color.WHITE,
        RED: cc.Color.RED,
        GREEN: cc.Color.GREEN
    },
    SIZE: {
        BENCH: {
            SELECTABLE: { width: 320, height: 320 },
            SELECTED: { width: 320, height: 320 },
        }
    },
    0: { //BENCH_INFO
        SELECTABLE_SIZE: { width: 320, height: 320 },
        SELECTED_SIZE: { width: 280, height: 280 },
    },
    1: { //BENCH_INFO
        SELECTABLE_SIZE: { width: 320, height: 320 },
        SELECTED_SIZE: { width: 280, height: 280 },
    }
};
cc.Class({
    extends: cc.Component,

    properties: {
        selectIndicator: cc.Node,
        selectedIndex: cc.Label,
        errorSF: cc.SpriteFrame,
        pokemonSprite: cc.Sprite,
        evolutionPkmSprite: cc.Sprite,
        hpBar: cc.Node,
        energy: cc.Node,
        effect: cc.Node,

    },
    init: function (typeSlot) {
        //Define misc
        this.LOG_TAG = "[BATTLE_SLOT]";
        this._onSelectedCallBack = function () { cc.log(this.LOG_TAG, "SELECTED_CALLBACK") };
        //Init data
        this.typeSlot = typeSlot;
        this._isSelectable = false;
        this._hasPKM = false;
        this._pkmData = null;
        this._inPlayTurn = -1;
        this._containedCardIds = [];
        this._selected = false;

        //Init UI
        switch (typeSlot) {
            case (BATTLE_SLOT.ACTIVE_TYPE):
                this.initActiveSlotUI();
                break;
            case (BATTLE_SLOT.BENCH_TYPE):
                this.initBenchSlotUI();
                break;
            default:
                cc.log(this.LOG_TAG, "error:", "SLOT_TYPE_NOT_FOUND");
        }
        //Listen to events
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        //this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);


    },
    initActiveSlotUI: function () {
        this.node.size = BATTLE_SLOT.ACTIVE_SIZE;
        this.node.scale = 1;
        this.selectIndicator.active = false;
    },
    initBenchSlotUI: function () {
        this.node.size = BATTLE_SLOT.BENCH_SIZE;
        this.node.scale = 1;
        this.selectIndicator.active = false;
    },
    showSelectableUI: function () {
        //cc.log("breakselect",JSON.stringify(BATTLE_SLOT));
        this.selectIndicator.width = BATTLE_SLOT[this.typeSlot].SELECTABLE_SIZE.width;
        this.selectIndicator.height = BATTLE_SLOT[this.typeSlot].SELECTABLE_SIZE.height;
        this.selectIndicator.color = BATTLE_SLOT.COLOR.WHITE;
        this.selectIndicator.active = true;
        this._isSelectable = true;
        //cc.log("test_w",JSON.stringify(this.selectIndicator.width));
    },
    hideSelectableUI: function () {
        this.selectIndicator.active = false;
        this._isSelectable = false;
    },
    showSelectedUI: function () {
        this.selectIndicator.color = BATTLE_SLOT.COLOR.GREEN;
        this.selectIndicator.active = true;
    },
    showPokemonFromBall: function (cardId) {
        //this._hasPKM = true;

        cc.log("show_pokemon", this._hasPKM);
        // cardId = 1;
        var cardData = JARVIS.getCardData(cardId);
        var endScale = cardData.bigScale;
        cc.log("test_slot_data", JSON.stringify(cardData));
        //Load sprite frame for pokemon
        var bigPkmUrl = cardData.bigPokemonUrl;
        this.pokemonSprite.node.active = true;
        this.evolutionPkmSprite.node.active = false;
        // cc.resources.load(bigPkmUrl, cc.SpriteFrame, function (error, loadedSpriteFrame) {
        //     if (!error) {
        //         cc.log(this.LOG_TAG, "LOAD_POKEMON_SUCC");
        //         this.pokemonSprite.spriteFrame = loadedSpriteFrame;
        //     } else {
        //         cc.log(this.LOG_TAG, "LOAD_POKEMON_FAILED");
        //         this.pokemonSprite.spriteFrame = this.errorSF;
        //     }
        // }.bind(this));
        this.pokemonSprite.spriteFrame = RES_MGR.getRes(bigPkmUrl);;
        this.evolutionPkmSprite.spriteFrame = RES_MGR.getRes(bigPkmUrl);
        this.pokemonSprite.node.scale = endScale * 0.1;
        this.pokemonSprite.node.opacity = 0;
        cc.tween(this.pokemonSprite.node)
            .to(1, { scale: endScale, opacity: 255 }).start();
        //Show Hp bar
        this.hpBar.active = true;

    },
    showAttachedEnergy: function () {

    },
    showEvolution: function (cardEvolve, cardToEvolve) {
        this._hasPKM = true;
       // cc.log("showEvolution",cardEvolve,cardToEvolve, bigPkmUrl);
        cardId = 1;
        var cardData = JARVIS.getCardData(cardToEvolve);

        var endScale = cardData.bigScale;
        //Load sprite frame for pokemon
        var bigPkmUrl = cardData.bigPokemonUrl;
        this.pokemonSprite.node.active = true;
        //cc.log("test_evolv2", cardEvolve,cardToEvolve);
        this.pokemonSprite.spriteFrame = RES_MGR.getRes(bigPkmUrl);

        this.pokemonSprite.node.scale = endScale * 0.1;
        this.pokemonSprite.node.opacity = 0;
        cc.tween(this.pokemonSprite.node)
            .to(1, { scale: endScale, opacity: 255 }).start();

        cardData = JARVIS.getCardData(cardEvolve);
        //endScale =  cardData.bigScale;
        cc.log("cardData",cardData.bigScale );
        endScale =  0.08;
        //Load sprite frame for pokemon
        bigPkmUrl = cardData.bigPokemonUrl;
        this.evolutionPkmSprite.node.active = true;
        this.evolutionPkmSprite.spriteFrame = RES_MGR.getRes(bigPkmUrl);

        this.evolutionPkmSprite.node.scale = endScale;
        this.evolutionPkmSprite.node.opacity = 255;
        cc.tween(this.evolutionPkmSprite.node)
            .to(1, { scale: endScale * 0.1, opacity: 0 }).start();
        cc.log(
            "test_null", this.effect
        )
        this.effect.active = true;
        this.effect.getComponent(cc.Animation).play("evolutionEffect");

        // //Show Hp bar
        // this.hpBar.active = true;

    },
    //Listeners
    _onTouchStart: function () {
        if (!this._isSelectable) return;
        cc.tween(this.selectIndicator)
            .to(0.1, { width: BATTLE_SLOT[this.typeSlot].SELECTED_SIZE.width, height: BATTLE_SLOT[this.typeSlot].SELECTED_SIZE.height })
            .start();
    },
    //_onTouchMove: function(){},
    _onTouchEnd: function () {

        if (!this._isSelectable) return;
        ;
        this._isSelectable = true;

        cc.log("ON_SLOT_TOUCH_END");
        this.node.emit(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, { selected: this._selected, battleSlot: this });

        // cc.tween(this.selectIndicator)
        //     .to(0.1, { width: BATTLE_SLOT[this.typeSlot].SELECTABLE_SIZE.width, height: BATTLE_SLOT[this.typeSlot].SELECTABLE_SIZE.height })
        //     .start();
        //cc.log("touch_end_select",JSON.stringify(this._onSelectedCallBack));
        //if (this._onSelectedCallBack == undefined) cc.log("cb_is_undefined"); else cc.log("cb_is_not_undefined");
        //this._onSelectedCallBack && this._onSelectedCallBack();
    },
    _onTouchCancel: function () {
        if (!this._isSelectable) return;
        this._isSelectable = true;
        this.onUnSelected();
    },
    onSelected: function () {
        this._selected = !this._selected;
        this.selectIndicator.color = cc.Color.GREEN;
    },
    onUnSelected: function () {
        this._selected = false;
        this.selectIndicator.color = cc.Color.WHITE;
        cc.tween(this.selectIndicator)
            .to(0.1, { width: BATTLE_SLOT[this.typeSlot].SELECTABLE_SIZE.width, height: BATTLE_SLOT[this.typeSlot].SELECTABLE_SIZE.height })
            .start();
    },
    //Action
    showSelectedIndex: function (idx) {
        this.selectedIndex.node.active = true;
        this.selectedIndex.node.color = cc.Color.GREEN;
        this.selectedIndex.string = idx;
    },
    hideSelectedIndex: function () {
        this.selectedIndex.node.active = false;
    },
    //Check
    hasPokemon: function () {
        //cc.log("_hasPKM", this._hasPKM);
        return this._hasPKM;
    },
    hasPokemonToEvolve: function (stageCardId, turnDrop) {
        var stageCardData = JARVIS.getCardData(stageCardId);
        cc.log("check_evolve", this._pkmData.pkdId, stageCardData.evolveFrom, turnDrop, this._inPlayTurn);
        return this._pkmData.pkdId == stageCardData.evolveFrom && turnDrop > this._inPlayTurn;
    },

    //Set
    setHasPkm: function (has) {
        this._hasPKM = has;
        cc.log(this.LOG_TAG, "HAS_POKEMON", this._hasPKM);
    },
    setInPlayTurn: function (turn) {
        this._inPlayTurn = turn;
        cc.log(this.LOG_TAG, "IN_PLAY_TURN", this._inPlayTurn);
    },
    setPkmCardId: function (cardId) {
        this._cardId = cardId;
        this._pkmData = JARVIS.getCardData(cardId);
        cc.log(this.LOG_TAG, "CARD_POKEMON_ID", this._cardId);
    },
    setNewCard: function (cardId) {
        this._containedCardIds.push(cardId);
        cc.log(this.LOG_TAG, "CARD_POKEMON_ID", this._containedCardIds);
    },
    setSelectedCallback: function (cb) { this._onSelectedCallBack = cb; },
    //Get
    getCardPokemonId: function () {
        return this._cardId;
    }
});
