
cc.Class({
  extends: cc.Component,

  properties: {
    playerActiveSlotNode: cc.Node,
    playerBenchSlotNode: [cc.Node],

    oppActiveSlotNode: cc.Node,
    oppBenchSlotNode: [cc.Node],

    //UI for drop checker
    activeDropChecker: cc.Node,
    benchDropChecker: cc.Node
  },
  init: function (gameManager) {
    this.LOG_TAG = "[BATTLE_AREA]";
    this.gm = gameManager;

    this._activeHolder = {};
    this._benchHolder = {};
    this._numBench = {};
    this._maxBench = {};
    //PLAYER_SIDE
    this._activeHolder[PLAYER_ID] = this.playerActiveSlotNode.getComponent("CardHolder"); this._activeHolder[PLAYER_ID].init(this.gm, BOARD.ACTIVE_PLACE);
    this._numBench[PLAYER_ID] = 0;
    this._maxBench[PLAYER_ID] = BOARD.MAX_BENCH;
    this._benchHolder[PLAYER_ID] = [];
    var benchIdx = 0;
    for (var benchHolderNode of this.playerBenchSlotNode) {
      var cardHolder = benchHolderNode.getComponent("CardHolder");
      cardHolder.init(this.gm, BOARD.BENCH);
      this._benchHolder[PLAYER_ID].push(cardHolder);
      //Set drop checker
      var dropChecker = cardHolder.getDropChecker();
      if (dropChecker) {
        dropChecker.setOtherTag(COLLIDER_TAG.CARD);
        dropChecker.setEnterCb(this.onColEnterBecnhSlot.bind(this, BOARD.BENCH_SLOT, benchIdx));
        dropChecker.setExitCb(this.onColExit.bind(this));
        dropChecker.setCheckPointInColliderEnabled(true);
        dropChecker.i = "bench_slot";
        benchIdx++;
      }
    }
    //OPPONENT_SIDE
    this._activeHolder[OPPONENT_ID] = this.oppActiveSlotNode.getComponent("CardHolder"); this._activeHolder[OPPONENT_ID].init(this.gm, BOARD.ACTIVE_PLACE);
    this._numBench[OPPONENT_ID] = 0;
    this._maxBench[OPPONENT_ID] = BOARD.MAX_BENCH;
    this._benchHolder[OPPONENT_ID] = [];
    for (var benchHolderNode of this.oppBenchSlotNode) {
      var cardHolder = benchHolderNode.getComponent("CardHolder");
      cardHolder.init(this.gm, BOARD.BENCH);
      this._benchHolder[OPPONENT_ID].push(cardHolder);

    }


    //Set up drop checker
    //--Active place
    this.activeChecker = this.activeDropChecker.getComponent("DropChecker");
    this.activeChecker.setOtherTag(COLLIDER_TAG.CARD);
    //this.activeChecker.setSelfTag(COLLIDER_TAG.CARD_CHECKER);
    this.activeChecker.setEnterCb(this.onColEnter.bind(this, BOARD.ACTIVE_PLACE));
    this.activeChecker.setExitCb(this.onColExit.bind(this));
    this.activeChecker.setCheckPointInColliderEnabled(true);
    this.activeChecker.i = "active_slot";
    //--Bench
    this.benchChecker = this.benchDropChecker.getComponent("DropChecker");
    this.benchChecker.setOtherTag(COLLIDER_TAG.CARD);
    //this.activeChecker.setSelfTag(COLLIDER_TAG.CARD_CHECKER);
    this.benchChecker.setEnterCb(this.onColEnter.bind(this, BOARD.BENCH));
    this.benchChecker.setExitCb(this.onColExit.bind(this));
    this.benchChecker.setCheckPointInColliderEnabled(true);
    this.benchChecker.i = "whole_bench";


  },
  //For drop checker
  onColEnterBecnhSlot: function (dropPlace, i, dropCardNode) {//Detecting dropped Card from user
    var card = dropCardNode.getComponent("BasicCard");
    card.canDrop = true;
    card.dropPlace = dropPlace;
    card.benchIdx = i;
  },
  onColEnter: function (dropPlace, dropCardNode) {//Detecting dropped Card from user
    var card = dropCardNode.getComponent("BasicCard");
    card.canDrop = true;
    card.dropPlace = dropPlace;
  },
  onColExit: function (dropCardNode) {//Detecting dropped Card from user
    var card = dropCardNode.getComponent("BasicCard");
    card.canDrop = false;
    card.dropPlace = undefined;

  },

  //ACTIONS LIST
  playerDropCard: function (cardId, cardNode, dropPlace, benchIdx) { //Action
    if (dropPlace == BOARD.ACTIVE_PLACE) {
      cc.log("PLAYER_DROP_CARD", cardId, "AT_ACTIVE_PLACE");
      //this._activeHolder[PLAYER_ID].addCard(cardId);
      //this._activeHolder[PLAYER_ID].doShowDropPokemonCard(cardId, cardNode);
      this._processCardOnDrop(PLAYER_ID, cardId, this._activeHolder[PLAYER_ID], cardNode);

      //this.activeChecker.enabledCheckCollision(false);
      this.activeChecker.hideArea();
    }
    else if (dropPlace == BOARD.BENCH) {
      cc.log("PLAYER_DROP_CARD", cardId, "AT_BENCH_PLACE");
      for (const benchHolder of this._benchHolder[PLAYER_ID]) {
        if (!benchHolder.hasPokemon()) {
          //benchHolder.addCard(cardId);
          //benchHolder.doShowDropPokemonCard(cardId, cardNode);
          this._processCardOnDrop(PLAYER_ID, cardId, benchHolder, cardNode);

          this._numBench[PLAYER_ID]++;
          break;
        }
      }
      //this.benchChecker.enabledCheckCollision(false);
      this.benchChecker.hideArea();
    }
    else if (dropPlace == BOARD.BENCH_SLOT) {
      cc.log("PLAYER_DROP_CARD", cardId, "AT_BENCH_SLOT");
      var benchHolder = this._benchHolder[PLAYER_ID][benchIdx];
      var dropChecker = benchHolder.getDropChecker();
      dropChecker.hideArea();
      this._processCardOnDrop(PLAYER_ID, cardId, benchHolder, cardNode);

      //benchHolder.addCard(cardId);
      //benchHolder.doShowDropPokemonCard(cardId, cardNode);

    }

    this.enableSelect(false);

    var client = this.gm.getClient();
    var card = cardNode.getComponent("BasicCard")
    var data = {
      cardId: cardId,
      idxHand: card.getIdx(),
      dropPlace: dropPlace,
      benchIdx: benchIdx
    };
    client.sendRoomPackage(NW_REQUEST.CMD_ROOM_DROP_CARD, data)
  },
  oppDropCard: function (idx, cardId, dropPlace, benchIdx) { //Action
    var oppHand = this.gm.getHand(OPPONENT_ID);
    var cardNode = oppHand.replaceCard(cardId, idx);
    if (dropPlace == BOARD.ACTIVE_PLACE) {
      cc.log("OPP_DROP_CARD", cardId, "AT_ACTIVE_PLACE");
      // this._activeHolder[OPPONENT_ID].addCard(cardId);
      // this._activeHolder[OPPONENT_ID].doShowDropPokemonCard(cardId, cardNode);
      this._processCardOnDrop(OPPONENT_ID, cardId, this._activeHolder[OPPONENT_ID], cardNode);
      oppHand.resetCardPosOnDrop(idx);
    }
    else if (dropPlace == BOARD.BENCH) {
      cc.log("OPP_DROP_CARD", cardId, "AT_BENCH");
      for (const benchHolder of this._benchHolder[OPPONENT_ID]) {
        if (!benchHolder.hasPokemon()) {
          // benchHolder.addCard(cardId);
          // benchHolder.doShowDropPokemonCard(cardId, cardNode);
          this._processCardOnDrop(OPPONENT_ID, cardId, benchHolder, cardNode);
          this._numBench[OPPONENT_ID]++;
          oppHand.resetCardPosOnDrop(idx);
          break;
        }
      }
    }
    else if (dropPlace == BOARD.BENCH_SLOT) {
      cc.log("OPP_DROP_CARD", cardId, "AT_BENCH_SLOT", benchIdx);
      var benchHolder = this._benchHolder[OPPONENT_ID][benchIdx];
      // benchHolder.addCard(cardId);
      // benchHolder.doShowDropPokemonCard(cardId, cardNode);
      this._processCardOnDrop(OPPONENT_ID, cardId, benchHolder, cardNode);

      this._numBench[OPPONENT_ID]++;
      oppHand.resetCardPosOnDrop(idx);
    }

  },
  _processCardOnDrop(playerId, cardId, cardHolder, cardNode) {
    var cardData = JARVIS.getCardData(cardId);
    switch (cardData.category) {
      case CONST.CARD.CAT.PKM:
        {
          cardHolder.addCard(cardId);
          cardHolder.doShowDropPokemonCard(cardId, cardNode);
          break;
        }
      case CONST.CARD.CAT.ENERGY:
        {
          cardHolder.addCard(cardId);
          cardHolder.doShowAttachEnergy(cardId, cardNode);
          this.gm.player[playerId].setAttachEnergyEnabled(false);
          break;
        }
    }

  },

  //---

  //---
  //Enable
  enableSelectActive(enabled) {
    this.activeChecker.enabledCheckCollision(enabled);
  },
  enableSelectBench(enabled) {
    this.benchChecker.enabledCheckCollision(enabled);
  },
  enabledEvolvable(enabled) {
    if (this._activeHolder[PLAYER_ID].hasPokemon() && this._activeHolder[PLAYER_ID].isEvolvable()) {
      this.activeChecker.enabledCheckCollision(enabled);
    }
    for (const benchHolder of this._benchHolder[PLAYER_ID]) {
      if (benchHolder.hasPokemon() && benchHolder.isEvolvable()) {
        var dropChecker = benchHolder.getDropChecker();
        dropChecker.enabledCheckCollision(enabled);
      }
    }
  },
  enabledPokemonsSelectable: function (enabled) {
    if (this._activeHolder[PLAYER_ID].hasPokemon()) {
      this.activeChecker.enabledCheckCollision(enabled);
    }
    for (const benchHolder of this._benchHolder[PLAYER_ID]) {
      if (benchHolder.hasPokemon()) {
        var dropChecker = benchHolder.getDropChecker();
        dropChecker.enabledCheckCollision(enabled);
      }
    }
  },
  enableSelect(enabled) {
    this.activeChecker.enabledCheckCollision(enabled);
    this.benchChecker.enabledCheckCollision(enabled);
    for (const benchHolder of this._benchHolder[PLAYER_ID]) {
      var dropChecker = benchHolder.getDropChecker();
      if (dropChecker) dropChecker.enabledCheckCollision(enabled);
    }
  },
  //--
  //Check
  playerHasActivePKM(playerId) { //Player might be user or opponent
    return this._activeHolder[playerId].hasPokemon();
  },
  playerHasFullBench() {
    return this._numBench[PLAYER_ID] >= this._maxBench[PLAYER_ID];
  }
});