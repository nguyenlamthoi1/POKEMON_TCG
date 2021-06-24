
cc.Class({
  extends: cc.Component,

  properties: {
    playerActiveSlotNode: cc.Node,
    //UI for card dropping
    activeDropChecker: cc.Node,
  },
  init: function (gameManager) {
    this.LOG_TAG = "[BATTLE_AREA]";
    this.gm = gameManager;

    this._activeHolder = {};
    this._activeHolder[PLAYER_ID] = this.playerActiveSlotNode.getComponent("CardHolder"); this._activeHolder[PLAYER_ID].init(this.gm, CONST.BATTLE_SLOT.ACTIVE_TYPE);

    //Set up checker
    this.activeChecker = this.activeDropChecker.getComponent("DropChecker");
    this.activeChecker.setOtherTag(COLLIDER_TAG.CARD);
    //this.activeChecker.setSelfTag(COLLIDER_TAG.CARD_CHECKER);
    this.activeChecker.setEnterCb(this.onColEnter.bind(this));
    this.activeChecker.setExitCb(this.onColExit.bind(this));
    this.activeChecker.setCheckPointInColliderEnabled(true);
  },
  //For drop checker
  onColEnter: function (dropCardNode) {//Detecting dropped Card from user
    var card = dropCardNode.getComponent("BasicCard");
    card.canDrop = true;
  },
  onColExit: function (dropCardNode) {//Detecting dropped Card from user
    var card = dropCardNode.getComponent("BasicCard");
    card.canDrop = false;
  },
  playerDropCard: function(cardId, cardNode){ //Action
      cc.log("PLAYER_DROP_CARD", cardId, cardNode);
      this._activeHolder[PLAYER_ID].addCard(cardId);
      this._activeHolder[PLAYER_ID].doShowDropPokemonCard(cardId, cardNode);
  },
  //---
  //Enable
  enabledSelectActive(enabled){
    this.activeChecker.enabledCheckCollision(enabled);
  },
  //--
  //Check
  playerHasActivePKM(playerId) { //Player might be user or opponent
    return this._activeHolder[playerId].hasPokemon();
  }
});