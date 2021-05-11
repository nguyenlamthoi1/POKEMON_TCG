
cc.Class({
  extends: cc.Component,

  properties: {
    cancelSelectBtn: cc.Button,
    endTurnBtn: cc.Button,
    playerBench: [cc.Node],
    playerActiveSlot: cc.Node,
    opponentBench: [cc.Node],
    opponentActiveSlot: cc.Node,
    playerTrainer: cc.Node,
    opponentTrainer: cc.Node
  },
  init: function(gameManager)
  {
    this.gm = gameManager;
    //Init player's active Battle Slot
    this.playerActiveSlot.getComponent("BattleSlot").init(CONST.BATTLE_SLOT.ACTIVE_TYPE);
    //Init Battle Slot on Bench
    for (var battleSlot of this.playerBench){
      // var battleSlot = this.playerBench[i]; //Get battle slot to init
      battleSlot.getComponent("BattleSlot").init(CONST.BATTLE_SLOT.BENCH_TYPE);
    }
    //Listeners
    this.cancelSelectBtn.node.on("click", this.onTouchCancel, this);
  },
   //Method
  showSelectabledUIs: function(cardId, selectData){
    //Enabled drop other cards
    this.gm.getPlayer().enableDrop(false);
    //Show cancel btn
    this.cancelSelectBtn.node.active = true;
    this.endTurnBtn.node.active = false;
    //cc.log("show_select",JSON.stringify(selectData));
    switch(selectData.type){
      case SELECTION.TYPE.PLAYER_EMPTY_ACTIVE:{//Find empty active slot
        var battleSlotScr = this.playerActiveSlot.getComponent("BattleSlot");
        battleSlotScr.setSelectedCallback(
         
          this._getSelectedCallback(selectData, cardId, this.playerActiveSlot)
        );
        battleSlotScr.showSelectableUI();
        return true;
      };
      break;
      case SELECTION.TYPE.PLAYER_EMPTY_BENCH:{  //Find n empty bench slot
        var numSlotNeedSelect = selectData.selectNum;
        if(numSlotNeedSelect < 1) return false;
        var numFound = 0;
        for (var battleSlot of this.playerBench){  
          var battleSlotScr = battleSlot.getComponent("BattleSlot");
          if(!battleSlotScr.hasPokemon()){
            battleSlotScr.setSelectedCallback(
              this._getSelectedCallback(selectData, cardId, battleSlot)
            );
          battleSlotScr.showSelectableUI();
          numFound ++;
          if(numFound == numSlotNeedSelect) return true;
          }
        }
      };
      break;
      case SELECTION.TYPE.PLAYER_ALL_PKM:{
        cc.log("show_select");
        //Active slot
        var battleSlotScr = this.playerActiveSlot.getComponent("BattleSlot");
        battleSlotScr.setSelectedCallback(
          
          function(){ 
            cc.log("DO_STH");
            this.hideSelectableUIs();
            this.gm.node.emit(CONST.GAME_PHASE.ON_SELECT_DONE);}.bind(this)

          //this._getSelectedCallback(selectData, cardId, this.playerActiveSlot)
        );
        battleSlotScr.showSelectableUI();
        //Bench slots
        for (var battleSlot of this.playerBench){  
          var battleSlotScr = battleSlot.getComponent("BattleSlot");
          
          if(battleSlotScr.hasPokemon()){
            
            battleSlotScr.setSelectedCallback(
              function(){  
                cc.log("DO_STH");
              this.hideSelectableUIs();
              this.gm.node.emit(CONST.GAME_PHASE.ON_SELECT_DONE);}.bind(this)
  
            );
          battleSlotScr.showSelectableUI();
          }
        }
        return true;
      };
      break;
    }
   
  },
  hideSelectableUIs: function(){
    cc.log("hide_ui");
    //Hide cancel btn
    this.cancelSelectBtn.node.active = false;
    if(this.gm.isPlayerTurn()){
      this.endTurnBtn.node.active = true;
      this.gm.getPlayer().enableDrop(true);
    }
    for (var battleSlot of this.playerBench){
      var battleSlotScr = battleSlot.getComponent("BattleSlot");
      battleSlotScr.hideSelectableUI();
    }  
    this.playerActiveSlot.getComponent("BattleSlot").hideSelectableUI();
  },  
  _getSelectedCallback: function(selectData, cardId, battleSlot){
    var retCb;
    if(selectData.callbackType == SELECTION.CB_TYPE.SHOW_PKM){
      retCb = function(battleSlot, cardId){ //Show pokemon after selected
      var battleSlotScr = battleSlot.getComponent("BattleSlot");
      var trainer = this.playerTrainer.getComponent("Trainer");
      //Has Pokemon = true
      battleSlotScr.setHasPkm(true);
      //Find position of battle slot in local node "Trainer"
      var battleSlotWPos = battleSlot.parent.convertToWorldSpaceAR(battleSlot.position);
      var battleSlotLPos = this.playerTrainer.convertToNodeSpaceAR(battleSlotWPos);
      trainer.throwBall(battleSlotLPos, battleSlotScr.showPokemonFromBall.bind(battleSlotScr,cardId));
      //Turn off selected
      this.hideSelectableUIs();
      //Notify selection done
      this.gm.node.emit(CONST.GAME_PHASE.ON_SELECT_DONE);

      }.bind(this, battleSlot, cardId);
    } 
    return retCb;
  }, 
  //Listeners
  onTouchCancel: function(){
    cc.log("onTouchCancel");
    this.hideSelectableUIs();
    this.gm.node.emit(CONST.GAME_PHASE.ON_SELECT_CANCEL);
  },
  //Check
  playerHasActivePkm: function(){
    return this.playerActiveSlot.getComponent("BattleSlot").hasPokemon();
  },
  //Get and Set
  getPlayerTrainer: function(){return this.playerTrainer;},
  getPlayerBench: function(){},
  getPlayerActiveSlot: function(){return this.playerActiveSlot;}   
});
