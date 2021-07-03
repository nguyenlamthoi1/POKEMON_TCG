
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
    for (var benchHolderNode of this.playerBenchSlotNode) {
      var cardHolder = benchHolderNode.getComponent("CardHolder");
      cardHolder.init(this.gm, BOARD.BENCH);
      this._benchHolder[PLAYER_ID].push(cardHolder);
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

    //--Bench
    this.benchChecker = this.benchDropChecker.getComponent("DropChecker");
    this.benchChecker.setOtherTag(COLLIDER_TAG.CARD);
    //this.activeChecker.setSelfTag(COLLIDER_TAG.CARD_CHECKER);
    this.benchChecker.setEnterCb(this.onColEnter.bind(this, BOARD.BENCH));
    this.benchChecker.setExitCb(this.onColExit.bind(this));
    this.benchChecker.setCheckPointInColliderEnabled(true);

  },
  //For drop checker
  onColEnter: function (dropPlace, dropCardNode) {//Detecting dropped Card from user
    var card = dropCardNode.getComponent("BasicCard");
    card.canDrop = true;
    card.dropPlace = dropPlace;
  },
  onColExit: function (dropCardNode) {//Detecting dropped Card from user
    var card = dropCardNode.getComponent("BasicCard");
    card.canDrop = false;
    card.dropPlace = undefined;
    cc.log("ON_EXIT", card.canDrop);

  },

  //ACTIONS LIST
  playerDropCard: function (cardId, cardNode, dropPlace) { //Action
    if (dropPlace == BOARD.ACTIVE_PLACE) {
      cc.log("PLAYER_DROP_CARD", cardId, "AT_ACTIVE_PLACE");
      this._activeHolder[PLAYER_ID].addCard(cardId);
      this._activeHolder[PLAYER_ID].doShowDropPokemonCard(cardId, cardNode);
      this.activeChecker.enabledCheckCollision(false);
      this.activeChecker.hideArea();

    }
    else if (dropPlace == BOARD.BENCH) {
      cc.log("PLAYER_DROP_CARD", cardId, "AT_BENCH_PLACE");
      for (const benchHolder of this._benchHolder[PLAYER_ID]) {
        if (!benchHolder.hasPokemon()) {
          benchHolder.addCard(cardId);
          benchHolder.doShowDropPokemonCard(cardId, cardNode);
          this._numBench[PLAYER_ID]++;
          break;
        }
      }
      this.benchChecker.enabledCheckCollision(false);
      this.benchChecker.hideArea();
    }
    var client = this.gm.getClient();
    var card = cardNode.getComponent("BasicCard")
    data = {
      cardId: cardId,
      idxHand: card.getIdx(),
      dropPlace: dropPlace
    };
    client.sendRoomPackage(NW_REQUEST.CMD_ROOM_DROP_CARD, data)
  },
  oppDropCard: function (idx, cardId, dropPlace) { //Action
    var oppHand = this.gm.getHand(OPPONENT_ID);
    var cardNode = oppHand.replaceCard(cardId, idx);
    if (dropPlace == BOARD.ACTIVE_PLACE) {
      cc.log("OPP_DROP_CARD", cardId, "AT_ACTIVE_PLACE");
      this._activeHolder[OPPONENT_ID].addCard(cardId);
      this._activeHolder[OPPONENT_ID].doShowDropPokemonCard(cardId, cardNode);
      oppHand.resetCardPosOnDrop(idx);
    }
    else if (dropPlace == BOARD.BENCH) {
      cc.log("OPP_DROP_CARD", cardId, "AT_BENCH_PLACE");
      for (const benchHolder of this._benchHolder[OPPONENT_ID]) {
        if (!benchHolder.hasPokemon()) {
          benchHolder.addCard(cardId);
          benchHolder.doShowDropPokemonCard(cardId, cardNode);
          this._numBench[OPPONENT_ID]++;
          oppHand.resetCardPosOnDrop(idx);
          break;
        }
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
  enableSelect(enabled) {
    this.activeChecker.enabledCheckCollision(enabled);
    this.benchChecker.enabledCheckCollision(enabled);
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