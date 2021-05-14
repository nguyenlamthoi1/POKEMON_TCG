
cc.Class({
  extends: cc.Component,

  properties: {
    cancelSelectBtn: cc.Button,
    selectBtn: cc.Button,
    endTurnBtn: cc.Button,
    playerBench: [cc.Node],
    playerActiveSlot: cc.Node,
    opponentBench: [cc.Node],
    opponentActiveSlot: cc.Node,
    playerTrainer: cc.Node,
    opponentTrainer: cc.Node
  },
  init: function (gameManager, notifier) {
    this.gm = gameManager;
    this.notifier = notifier;
    //Init player's active Battle Slot
    this.playerActiveSlot.getComponent("BattleSlot").init(CONST.BATTLE_SLOT.ACTIVE_TYPE);

    //Init Battle Slot on Bench
    for (var battleSlot of this.playerBench) {
      // var battleSlot = this.playerBench[i]; //Get battle slot to init
      battleSlot.getComponent("BattleSlot").init(CONST.BATTLE_SLOT.BENCH_TYPE);
    }
    //Listeners
    this.cancelSelectBtn.node.on("click", this.onTouchCancel, this);
    this.selectBtn.node.on("click", this.onTouchSelect, this);

    //Data
    this._onSelecting = false;

  },
  //Method
  showSelectabledUIs: function (cardId, selectData) {
    //On selecting
    this._onSelecting = true;
    this._needSelectedNum = selectData.selectNum | 0;
    this._selectedNum = 0;
    this._para = [];
    //Show notifier
    this.notifier.notify("SELECT ", this._needSelectedNum);
    //Enabled drop other cards
    this.gm.getPlayer().enableDrop(false);
    //Show cancel btn
    this.cancelSelectBtn.node.active = true;
    this.selectBtn.node.active = true;
    this.endTurnBtn.node.active = false;
    //cc.log("show_select",JSON.stringify(selectData));
    switch (selectData.type) {
      case SELECTION.TYPE.PLAYER_EMPTY_ACTIVE: {//Find empty active slot
        var battleSlotScr = this.playerActiveSlot.getComponent("BattleSlot");
        //Listen to events
        this.playerActiveSlot.on(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
        battleSlotScr.showSelectableUI();
        return true;
      };
        break;
      case SELECTION.TYPE.PLAYER_EMPTY_BENCH: {  //Find n empty bench slot
        var numSlotNeedSelect = selectData.selectNum;
        if (numSlotNeedSelect < 1) return false;
        var numFound = 0;
        for (var battleSlot of this.playerBench) {
          //Listen to events
          battleSlot.on(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
          var battleSlotScr = battleSlot.getComponent("BattleSlot");
          if (!battleSlotScr.hasPokemon()) {
            battleSlotScr.showSelectableUI();
            numFound++;
            if (numFound == numSlotNeedSelect) return true;
          }
        }
      };
        break;
      case SELECTION.TYPE.PLAYER_ALL_PKM: {
        cc.log("show_select");
        //Active slot
        var battleSlotScr = this.playerActiveSlot.getComponent("BattleSlot");
        // battleSlotScr.setSelectedCallback(

        //   function () {
        //     cc.log("DO_STH");
        //     this.hideSelectableUIs();
        //     //this.gm.node.emit(CONST.GAME_PHASE.ON_SELECT_DONE);
        //   }.bind(this)

        //   //this._getSelectedCallback(selectData, cardId, this.playerActiveSlot)
        // );
        battleSlotScr.showSelectableUI();
        //Bench slots
        for (var battleSlot of this.playerBench) {
          var battleSlotScr = battleSlot.getComponent("BattleSlot");

          if (battleSlotScr.hasPokemon()) {

            // battleSlotScr.setSelectedCallback(
            //   function () {
            //     cc.log("DO_STH");
            //     this.hideSelectableUIs();
            //     //this.gm.node.emit(CONST.GAME_PHASE.ON_SELECT_DONE);
            //   }.bind(this)

            // );
            battleSlotScr.showSelectableUI();
          }
        }
        return true;
      };
        break;
      case SELECTION.TYPE.ALL_PKM_TO_EVOLVE: {
        cc.log("show_select");
        //Active slot
        var battleSlotScr = this.playerActiveSlot.getComponent("BattleSlot");
        if (battleSlotScr.hasPokemon() && battleSlotScr.hasPokemonToEvolve(cardId, this.gm.getCurrentTurn())) {
          //Listen to events
          this.playerActiveSlot.on(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
          battleSlotScr.showSelectableUI();
        }
        //Bench slots
        for (var battleSlot of this.playerBench) {
          var battleSlotScr = battleSlot.getComponent("BattleSlot");
          if (battleSlotScr.hasPokemon() && battleSlotScr.hasPokemonToEvolve(cardId, this.gm.getCurrentTurn())) {
            battleSlot.on(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
            battleSlotScr.showSelectableUI();
          }
        }
      };
        break;
    }

  },
  hideSelectableUIs: function () {
    //On not selecting 
    this._onSelecting = false;
    //Hide cancel btn
    this.cancelSelectBtn.node.active = false;
    this.selectBtn.node.active = false;
    if (this.gm.isPlayerTurn()) {
      this.endTurnBtn.node.active = true;
      this.gm.getPlayer().enableDrop(true);
    }
    for (var battleSlot of this.playerBench) {
      var battleSlotScr = battleSlot.getComponent("BattleSlot");
      battleSlot.off(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
      battleSlotScr.hideSelectableUI();
      battleSlotScr.hideSelectedIndex();
    }
    this.playerActiveSlot.getComponent("BattleSlot").hideSelectableUI();
    this.playerActiveSlot.getComponent("BattleSlot").hideSelectedIndex();
    this.playerActiveSlot.off(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);

  },
  _getSelectedCallback: function (selectData, cardId, battleSlot) {
    var retCb;
    switch (selectData.callbackType) {
      case SELECTION.CB_TYPE.SHOW_PKM:
        {
          retCb = function (battleSlot, cardId) { //Show pokemon after selected
            var battleSlotScr = battleSlot.getComponent("BattleSlot");
            var trainer = this.playerTrainer.getComponent("Trainer");
            //Set up Battle Slot when have new Pokemon
            battleSlotScr.setHasPkm(true);
            battleSlotScr.setInPlayTurn(this.gm.getCurrentTurn());
            battleSlotScr.setPkmCardId(cardId);
            battleSlotScr.setNewCard(cardId);
            //Find position of battle slot in local node "Trainer"
            var battleSlotWPos = battleSlot.parent.convertToWorldSpaceAR(battleSlot.position);
            var battleSlotLPos = this.playerTrainer.convertToNodeSpaceAR(battleSlotWPos);
            trainer.throwBall(battleSlotLPos, battleSlotScr.showPokemonFromBall.bind(battleSlotScr, cardId));
            //Turn off selected
            this.hideSelectableUIs();
            //Notify selection done
            this.gm.node.emit(CONST.GAME_PHASE.ON_SELECT_DONE);

          }.bind(this, battleSlot, cardId);
        }
        break;
      case SELECTION.CB_TYPE.SHOW_PKM:
        {

        }
        break;
    }

    return retCb;
  },
  //Listeners
  onTouchCancel: function () {
    cc.log("TOUCH_CANCEL");
    this.hideSelectableUIs();
    this.gm.node.emit(CONST.GAME_PHASE.ON_SELECT_CANCEL);
  },
  onTouchSelect: function () {
    if (this._para.length == this._needSelectedNum) {
      this.gm.node.emit(CONST.GAME_PHASE.ON_SELECT_DONE, { para: this._para });
    } else {
      this.notifier.notify("SELECT NOT ENOUGH", cc.Color.Red);
    }
  },
  onSlotSelected: function (event) {
    if (!this._onSelecting) return;
    var battleSlot = event.battleSlot;
    var index = this._para.indexOf(battleSlot);
    if (index >= 0) { //If select a selected slot then unselect this one
      this._para.splice(index, 1); //Remove it
      battleSlot.hideSelectedIndex();
      battleSlot.onUnSelected();
      this._resetSelectedIdx();
    }
    else if (this._para.length < this._needSelectedNum) { //If we select a slot and not enough para then add this slot to para
      battleSlot.showSelectedIndex(this._para.length + 1);
      battleSlot.onSelected();
      this._para.push(battleSlot);
    }
    else {
      this.notifier.notify("SELECT ENOUGH", cc.Color.Red);
      battleSlot.onUnSelected();
    }
  },
  _resetSelectedIdx: function () {
    for (var i = 0; i < this._para.length; i++) {
      this._para[i].showSelectedIndex(i + 1);
    }
  },
  //Check
  playerHasActivePkm: function () {
    return this.playerActiveSlot.getComponent("BattleSlot").hasPokemon();
  },
  //Get and Set
  getPlayerTrainer: function () { return this.playerTrainer; },
  getPlayerBench: function () { },
  getPlayerActiveSlot: function () { return this.playerActiveSlot; },
  //Actions
  summonPokemon: function (battleSlot, cardId) {
    cc.log("SUMMON_A_POKEMON");
    var trainer = this.playerTrainer.getComponent("Trainer");
    //Set up Battle Slot when have new Pokemon
    battleSlot.setHasPkm(true);
    battleSlot.setInPlayTurn(this.gm.getCurrentTurn());
    battleSlot.setPkmCardId(cardId);
    battleSlot.setNewCard(cardId);
    //Find position of battle slot in local node "Trainer"
    var battleSlotWPos = battleSlot.node.parent.convertToWorldSpaceAR(battleSlot.node.position);
    var battleSlotLPos = trainer.node.convertToNodeSpaceAR(battleSlotWPos);
    trainer.throwBall(battleSlotLPos, battleSlot.showPokemonFromBall.bind(battleSlot, cardId));
    //Turn off selected
    this.hideSelectableUIs();
  },
  evolvePokemon: function (battleSlot, cardId) {
    cc.log("EVOLVE_POKEMON");
    var cardEvolved = cardId;
    var cardToEvolve = battleSlot.getCardPokemonId();
    //Set up Battle Slot when have new Pokemon
    battleSlot.setHasPkm(true);
    battleSlot.setInPlayTurn(this.gm.getCurrentTurn());
    battleSlot.setPkmCardId(cardId);
    battleSlot.setNewCard(cardId);
    battleSlot.showEvolution(cardToEvolve, cardEvolved);
    //Turn off selected
    this.hideSelectableUIs();
  }
});
