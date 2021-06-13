
cc.Class({
  extends: cc.Component,

  properties: {
    cancelSelectBtn: cc.Button,
    selectBtn: cc.Button,
    endTurnBtn: cc.Button,
    oppEndTurnBtn: cc.Button,
    playerBench: [cc.Node],
    playerActiveSlot: cc.Node,
    opponentBench: [cc.Node],
    opponentActiveSlot: cc.Node,
    playerTrainer: cc.Node,
    opponentTrainer: cc.Node
  },
  init: function (gameManager, notifier) {
    this.LOG_TAG = "[BATTLE_AREA]";
    this.gm = gameManager;
    this.notifier = notifier;
    this.topUI = this.gm.getTopUI().getComponent("TopUI");



    //Init player's active Battle Slot
    this.playerActiveSlot.getComponent("BattleSlot").init(CONST.BATTLE_SLOT.ACTIVE_TYPE);
    this.opponentActiveSlot.getComponent("BattleSlot").init(CONST.BATTLE_SLOT.ACTIVE_TYPE);
    //Init Battle Slot on Bench
    const DEFAULT_NUM_BENCH = 5;
    this._bench = {};
    this._bench[PLAYER_ID] = [];
    this._bench[OPPONENT_ID] = [];
    for (var i = 0; i < DEFAULT_NUM_BENCH; i++) {
      var playerBattleSlotComp = this.playerBench[i].getComponent("BattleSlot");
      playerBattleSlotComp.init(CONST.BATTLE_SLOT.BENCH_TYPE, this.gm.getPlayers()[PLAYER_ID]);
      var oppBattleSlotComp = this.opponentBench[i].getComponent("BattleSlot");
      oppBattleSlotComp.init(CONST.BATTLE_SLOT.BENCH_TYPE, this.gm.getPlayers()[OPPONENT_ID]);
      this._bench[PLAYER_ID].push(playerBattleSlotComp);
      this._bench[OPPONENT_ID].push(oppBattleSlotComp);
    }
    //Init Active Slots
    this._activeSlot = {};
    this._activeSlot[PLAYER_ID] = this.playerActiveSlot.getComponent("BattleSlot");
    this._activeSlot[OPPONENT_ID] = this.opponentActiveSlot.getComponent("BattleSlot");
    //Init Trainer
    this._trainer = {};
    this._trainer[PLAYER_ID] = this.playerTrainer.getComponent("Trainer");
    this._trainer[OPPONENT_ID] = this.opponentTrainer.getComponent("Trainer");


    //Listeners
    this.cancelSelectBtn.node.on("click", this.onTouchCancel, this);
    this.selectBtn.node.on("click", this.onTouchSelect, this);

    //Data
    this._onSelecting = false;

  },
  //Method
  v: function (selectData, cardId, player) {//Opt: player
    //Check player parameter
    if (!player) player = this.gm.getCurrentPlayer();
    //On selecting
    this._onSelecting = true;
    this._needSelectedNum = selectData.selectNum | 0;
    this._selectedNum = 0;
    this._para = [];
    //Show notifier
    this.notifier.notify("SELECT ", this._needSelectedNum);
    //Enabled drop other cards
    this.gm.getPlayerWithId(player.getId()).enableDrop(false);
    //Top UI show
    this.topUI.showUIonSelecting()

    //Log
    cc.log(this.LOG_TAG, "SHOW_SELECTION", JSON.stringify(selectData));
    //Process Select Data
    switch (selectData.type) {
      //--DESCRIPTION: FIND ACTIVE SLOT OF PLAYER OR OPPONENT
      case SELECTION.TYPE.PLAYER_EMPTY_ACTIVE: {
        var battleSlot = this._activeSlot[player.getId()];
        //Listen to events
        battleSlot.node.on(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
        battleSlot.showSelectableUI();
        break;
      };
      //--END--
      //--DESCRIPTION: FIND FIRST EMPTY SLOT ON BENCH
      case SELECTION.TYPE.PLAYER_EMPTY_BENCH: {
        var numSlotNeedSelect = selectData.selectNum;
        if (numSlotNeedSelect < 1) return false;
        var numFound = 0;
        for (var battleSlot of this._bench[player.getId()]) {
          //Listen to events
          battleSlot.node.on(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
          if (!battleSlot.hasPokemon()) {
            battleSlot.showSelectableUI();
            numFound++;
            if (numFound == numSlotNeedSelect) return true;
          }
        }
        break;
      };
      case SELECTION.TYPE.PLAYER_ALL_PKM: {
        //Active slot
        var battleSlot = this._activeSlot[player.getId()];
        battleSlot.node.on(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
        battleSlot.showSelectableUI();
        //Bench slots
        for (var battleSlot of this._bench[player.getId()]) {
          if (battleSlot.hasPokemon()) {
            battleSlot.node.on(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
            battleSlot.showSelectableUI();
          }
        }
        break;
      };
      case SELECTION.TYPE.ALL_PKM_TO_EVOLVE: {
        //Active slot
        var battleSlot = this._activeSlot[player.getId()];
        if (battleSlot.hasPokemon() && battleSlot.hasPokemonToEvolve(cardId, this.gm.getCurrentTurn())) {
          //Listen to events
          battleSlot.node.on(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
          battleSlot.showSelectableUI();
        }
        //Bench slots
        for (var battleSlot of this._bench[player.getId()]) {
          if (battleSlot.hasPokemon() && battleSlot.hasPokemonToEvolve(cardId, this.gm.getCurrentTurn())) {
            battleSlot.node.on(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
            battleSlot.showSelectableUI();
          }
        }
        break;
      };
    }

  },
  hideSelectableUIs: function () {
    //On not selecting 
    this._onSelecting = false;
    //TopUI hide
    this.topUI.hideUIonShowSelecting();
    //Enable Drop
    this.gm.getCurrentPlayer().enableDrop(true); //Can drop after select
    for (var i = PLAYER_ID; i <= OPPONENT_ID; i++) {
      for (var battleSlot of this._bench[i]) {
        battleSlot.node.off(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
        battleSlot.hideSelectableUI();
        battleSlot.hideSelectedIndex();
      }
      this._activeSlot[i].hideSelectableUI();
      this._activeSlot[i].hideSelectedIndex();
      this._activeSlot[i].node.off(CONST.BATTLE_SLOT.ON_SLOT_SELECTED, this.onSlotSelected, this);
    }
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
  hasActivePkm: function (player) {
    return this._activeSlot[player.getId()].hasPokemon();
  },
  //Get and Set
  getPlayerTrainer: function () { return this.playerTrainer; },
  getPlayerBench: function () { },
  getPlayerActiveSlot: function () { return this.playerActiveSlot; },
  getActiveSlotOf: function (id) { return this._activeSlot[id]; },
  //Actions
  summonPokemon: function (battleSlot, cardId, player) { //Opt: player
    //Check player parameter
    if (!player) player = this.gm.getCurrentPlayer();
    //Log
    cc.log(this.LOG_TAG, player.getId(), "SUMMON_A_POKEMON", JARVIS.getCardName(cardId));
    var trainer = this._trainer[player.getId()];
    //Set up data
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
  evolvePokemon: function (battleSlot, cardId, player) {//Opt: player
    cc.log("EVOLVE_POKEMON");
    //Check player parameter
    if (!player) player = this.gm.getCurrentPlayer();
    var cardEvolved = cardId;
    var cardToEvolve = battleSlot.getCardPokemonId();
    //Set up data
    battleSlot.setHasPkm(true);
    battleSlot.setInPlayTurn(this.gm.getCurrentTurn());
    battleSlot.setPkmCardId(cardId);
    battleSlot.setNewCard(cardId);
    battleSlot.showEvolution(cardToEvolve, cardEvolved);
    //Turn off selected
    this.hideSelectableUIs();
  },
  attachEnergy: function (battleSlot, cardId) {
    cc.log("ATTACH_ENERGY");
    //Set up data
    this.gm.getCurrentPlayer().setDroppedEnergy(true);
    battleSlot.setNewCard(cardId);
    //Do action
    battleSlot.showAttachedEnergy(cardId);
    //Turn off selected
    this.hideSelectableUIs();
  },
  attackOppActive: function (moveData) {
    cc.log("ATK_ACTIVE", JSON.stringify(moveData));
    var atkingSlot, atkedSlot;
    this.gm.getCurrentPlayer().enableUseMove(false);
    if (this.gm.getCurrentPlayer().sameId(PLAYER_ID)) {//player attack
      atkingSlot = this._activeSlot[PLAYER_ID];
      atkedSlot = this._activeSlot[OPPONENT_ID];
    } else { //Opponent attack
      atkingSlot = this._activeSlot[OPPONENT_ID];
      atkedSlot = this._activeSlot[PLAYER_ID];
    }
    atkingSlot.attackOppActivePkm(atkedSlot, moveData.value);
  }
});
