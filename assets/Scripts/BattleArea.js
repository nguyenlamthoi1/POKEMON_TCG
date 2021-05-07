
cc.Class({
    extends: cc.Component,

    properties: {
      playerBench: [cc.Node],
      playerActiveSlot: cc.Node,
      opponentBench: [cc.Node],
      opponentActiveSlot: cc.Node,
      playerTrainer: cc.Node,
      opponentTrainer: cc.Node
    },
    init: function(){
      //Init player's active Battle Slot
      this.playerActiveSlot.getComponent("BattleSlot").init(CONST.BATTLE_SLOT.ACTIVE_TYPE);
      //Init Battle Slot on Bench
      for (var battleSlot of this.playerBench){
        // var battleSlot = this.playerBench[i]; //Get battle slot to init
        battleSlot.getComponent("BattleSlot").init(CONST.BATTLE_SLOT.BENCH_TYPE);
      }
    },
    //Method
    showSelectabledUIs: function(cardId){
      // var trainer =this.battleArea.getComponent("BattleArea").getPlayerTrainer().getComponent("Trainer");
        // trainer.throwBall();
      //Find all empty slots
      cc.log("SHOW_SELECTABLE",cardId);
      for (var battleSlot of this.playerBench){
          var battleSlotScr = battleSlot.getComponent("BattleSlot");
          battleSlotScr.setSelectedCallback(
            function(battleSlot,cardId){
              cc.log("test_selected_cb");
              var battleSlotScr = battleSlot.getComponent("BattleSlot");
              var trainer = this.playerTrainer.getComponent("Trainer");
              //Find position of battle slot in local node "Trainer"
              var battleSlotWPos = battleSlot.parent.convertToWorldSpaceAR(battleSlot.position);
              var battleSlotLPos = this.playerTrainer.convertToNodeSpaceAR(battleSlotWPos);
              trainer.throwBall(battleSlotLPos, battleSlotScr.showPokemonFromBall.bind(battleSlotScr,cardId));

              //Turn off selected
              this.hideSelectableUIs();
            }.bind(this,battleSlot,cardId)
          );
          if(!battleSlotScr.hasPokemon()){
              battleSlotScr.showSelectableUI();
          }
      }
    },
    hideSelectableUIs: function(){
      for (var battleSlot of this.playerBench){
        var battleSlotScr = battleSlot.getComponent("BattleSlot");
          battleSlotScr.hideSelectableUI();
      }
    },
    //Get and Set
    getPlayerTrainer: function(){return this.playerTrainer;},
    getPlayerBench: function(){},
    getPlayerActiveSlot: function(){return this.playerActiveSlot;}
});
