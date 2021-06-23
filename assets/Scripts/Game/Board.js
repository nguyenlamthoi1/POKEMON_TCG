
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
      this.activeChecker.setCollisionCb(this.onReceiveC);
      this.activeChecker.setCheckPointInColliderEnabled(true);
    },
    onReceiveCard: function(){

    },

    //Check
    playerHasActivePKM(playerId){ //Player might be user or opponent
        return this._activeHolder[playerId].hasPokemon();
    }
});