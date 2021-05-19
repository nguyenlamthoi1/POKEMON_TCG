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
        flyingHpText: cc.Node,
        hpText: cc.Label,
        energyPanel: cc.Node,
        effect: cc.Node,


    },
    init: function (typeSlot) {
        //Define misc
        this.LOG_TAG = "[BATTLE_SLOT]";
        this._onSelectedCallBack = function () { cc.log(this.LOG_TAG, "SELECTED_CALLBACK") };
        //Init data
        this.typeSlot = typeSlot;
        this._isSelectable = false;
        this._isInfoShowable = true;

        this._hasPKM = false;
        this._pkmData = null;
        this._inPlayTurn = -1;
        this._containedCardIds = [];
        this._energy = {};
        this._selected = false;
        this._counterDmg = 0;
        this._hp = 100;
        this.hpText = "100/100";
        //  Energy data
        this._energyIcons = []; this._energyIcons.push(this.energyPanel.getChildByName("EnergyIcon"));

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
        cc.log("INIT_ACTIVE_SLOT");
        this.node.size = BATTLE_SLOT.ACTIVE_SIZE;
        this.node.scale = 1;
        this.selectIndicator.active = false;
    },
    initBenchSlotUI: function () {
        cc.log("INIT_BENCH_SLOT");

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
        this._isInfoShowable = false;
        //cc.log("test_w",JSON.stringify(this.selectIndicator.width));
    },
    hideSelectableUI: function () {
        this.selectIndicator.active = false;
        this._isSelectable = false;
        this._isInfoShowable = true;
    },
    showSelectedUI: function () {
        this.selectIndicator.color = BATTLE_SLOT.COLOR.GREEN;
        this.selectIndicator.active = true;
    },
    showPokemonFromBall: function (cardId) {
        //this._hasPKM = true;
        // cardId = 1;
        var cardData = JARVIS.getCardData(cardId);
        var endScale = cardData.bigScale;
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
        this._hp = cardData.hp;
        this.hpBar.active = true;
        this.hpText.string = (this._hp - this._counterDmg * 10) + "/" + this._hp;
        var pg = (this._hp - this._counterDmg * 10) / this._hp;
        cc.tween(this.hpBar.getComponent(cc.ProgressBar)).to(0.5, { progress: pg }).start();
        //this.hpBar.progress = 1;

    },
    showAttachedEnergy: function (energyCardId) {
        var cardData = JARVIS.getCardData(energyCardId);
        var layout = this.energyPanel.getComponent(cc.Layout);
        var foundEnergyIcon;
        for (var energyIcon of this._energyIcons) {
            if (!energyIcon.active) {
                cc.log("found_free_energy")
                foundEnergyIcon = energyIcon;
                break;
            }
        }
        if (!foundEnergyIcon) {//Not found free Energy Icon
            cc.log("not_found_free_energy")
            foundEnergyIcon = cc.instantiate(this._energyIcons[0]);
            this.energyPanel.addChild(foundEnergyIcon);
        }
        layout.updateLayout();
        foundEnergyIcon.active = true;
        foundEnergyIcon.getComponent(cc.Sprite).spriteFrame = RES_MGR.getRes(cardData.smallCardUrl);
        var localCenterPoint = this.energyPanel.convertToNodeSpaceAR(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2));
        var endPos = foundEnergyIcon.position;
        var endScale = foundEnergyIcon.scale;
        foundEnergyIcon.position = localCenterPoint;
        foundEnergyIcon.scale = foundEnergyIcon.scale * 4;
        foundEnergyIcon.angle = 0;
        cc.tween(foundEnergyIcon).
            to(0.5, { position: endPos, scale: endScale, angle: 360 })
            .start();

    },
    showEvolution: function (cardEvolve, cardToEvolve) {
        this._hasPKM = true;
        // cc.log("showEvolution",cardEvolve,cardToEvolve, bigPkmUrl);
        var cardData = JARVIS.getCardData(cardToEvolve);
        //Show Hp bar
        this._hp = cardData.hp;
        this.hpBar.active = true;
        this.hpText.string = (this._hp - this._counterDmg * 10) + "/" + this._hp;
        var pg = (this._hp - this._counterDmg * 10) / this._hp;
        cc.log("test_hp", cardData.hp, this._hp, this._counterDmg, this._hp - this._counterDmg * 10);
        cc.tween(this.hpBar.getComponent(cc.ProgressBar)).to(0.5, { progress: pg }).start();
        //--

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
        cc.log("cardData", cardData.bigScale);
        endScale = 0.08;
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



    },
    attackOppActivePkm: function (oppSlot, dmg) {
        cc.log("start_atk_opp", oppSlot);
        var delta = oppSlot.node.position.sub(this.node.position);
        cc.log("test_delta", JSON.stringify(delta));

        //Switch parent and modify zOrder to show correctly
        var fromPos = Utils.getLocalPosition(this.pokemonSprite.node, oppSlot.node);
        this.pokemonSprite.node.removeFromParent();
        oppSlot.node.addChild(this.pokemonSprite.node);
        this.pokemonSprite.node.position = fromPos;
        cc.tween(this.pokemonSprite.node)
            .to(0.2, { position: cc.v2(0, 0) })
            .to(0.3, { position: fromPos })
            .call(function (oppSlot) {
                //Restore parent and position
                this.pokemonSprite.node.removeFromParent();
                this.node.addChild(this.pokemonSprite.node);
                this.pokemonSprite.node.position = cc.v2(0, 0);
                oppSlot.reduceHp(dmg);
            }.bind(this, oppSlot))
            .start();
        //---
    },
    reduceHp: function (hp) {
        cc.log("TAKE_DMG1", hp, this._hp, this._counterDmg);
        this._counterDmg += hp / 10;
        var pg = (this._hp - hp) / this._hp;
        this._hp -= this._counterDmg*10;
        if(this._hp < 0) this._hp = 0;

        this.flyingHpText.getComponent(cc.Label).string = "-" + hp;
        this.flyingHpText.active = true;
        this.flyingHpText.scale = 1;

        cc.tween(this.flyingHpText)
            .to(0.2, { position: cc.v2(0, 20), scale: 3 })
            .delay(1)
            .call(function () {
                this.flyingHpText.active = false;
            }.bind(this))
            .start();
        cc.log("TAKE_DMG2", hp, this._hp, this._counterDmg, pg);

        cc.tween(this.hpBar.getComponent(cc.ProgressBar)).to(0.5, { progress: pg }).start();
    },
    //Listeners
    _onTouchStart: function () {
        cc.log("TOUCH_START_1");

        if (this._isInfoShowable) {

            var topUI = GM.getTopUI().getComponent("TopUI");
            if (this._cardId != undefined) {
                cc.log("show_card_info");
                topUI.showPokemonCardtoAttack(this._cardId, this);

            }
        }
        if (!this._isSelectable) return;

        cc.tween(this.selectIndicator)
            .to(0.1, { width: BATTLE_SLOT[this.typeSlot].SELECTED_SIZE.width, height: BATTLE_SLOT[this.typeSlot].SELECTED_SIZE.height })
            .start();
    },
    //_onTouchMove: function(){},
    _onTouchEnd: function () {

        if (this._isInfoShowable) {
            var topUI = GM.getTopUI().getComponent("TopUI");
            if (this._cardId != undefined) {
                cc.log("show_card_info");
                topUI.showPokemonCardtoAttack(this._cardId, this);

            }
        }
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
        if (this._isInfoShowable) {
            var topUI = GM.getTopUI().getComponent("TopUI");
            if (this._cardId != undefined) {
                cc.log("show_card_info");
                topUI.showPokemonCardtoAttack(this._cardId, this);

            }
        }

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
    isEnoughEnergy: function (moveIdx) {
        var moveInfo = this._moveSet[moveIdx]; //Move idx in a card. usually = 0 or = 1
        for (const costEnergy in moveInfo.cost) {
            cc.log("test_cost", costEnergy, this._energy[costEnergy], moveInfo.cost[costEnergy], this._energy[costEnergy] < moveInfo.cost[costEnergy]);
            if ((this._energy[costEnergy] | 0) < moveInfo.cost[costEnergy]) {
                return false;
            }
        }
        return true;

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
        this._moveSet = this._pkmData.moveInfo;
        cc.log(this.LOG_TAG, "SET_CARD_POKEMON_ID", this._cardId, JSON.stringify(this._moveSet));
    },
    setNewCard: function (cardId) {
        var cardData = JARVIS.getCardData(cardId);
        cc.log("test_new_card", JSON.stringify(cardData));
        if (cardData.category == CONST.CARD.CAT.PKM) {
            this._containedCardIds.push(cardId);
            cc.log(this.LOG_TAG, "ADD_CARD_POKEMON_ID", this._containedCardIds);
            this._hp = cardData.hp;
            //this.hpBar.active = true;
            this.hpText.string = (this._hp - this._counterDmg * 10) + "/" + cardData.hp;
            var pg = (this._hp - this._counterDmg * 10) / this._hp;
            cc.tween(this.hpBar.getComponent(cc.ProgressBar)).to(0.5, { progress: pg }).start();
        } else {
            if (cardData.category == CONST.CARD.CAT.ENERGY) {
                if (this._energy[cardData.energyType] == undefined) {
                    this._energy[cardData.energyType] = cardData.quantity | 0 ? cardData.quantity : 1;
                }
                else {
                    this._energy[cardData.energyType] += cardData.quantity | 0 ? cardData.quantity : 1;

                }
                cc.log(this.LOG_TAG, "ADD_ENERGY_CARD_POKEMON_ID", JSON.stringify(this._energy));
            }
            this._containedCardIds.unshift(cardId);
        }

    },
    setSelectedCallback: function (cb) { this._onSelectedCallBack = cb; },
    //Get
    getCardPokemonId: function () {
        return this._cardId;
    }
});
