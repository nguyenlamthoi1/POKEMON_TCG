
CardFactory = cc.Class({
    init: function(gameManager){
        this.CONST = {
            CAT:{
                POKEMON: "Pokemon",
                ENERGY: "Energy"
            }
        }
        this.DEBUG = true;
        this.LOG_TAG = "[FACTORY]";
        this.LANG = {
            CARD_ID_NOT_CORRECT: "[ERROR] [CARD_ID_NOT_CORRECT]"  
        }

        this.gameManager = gameManager;
        //Get all UIs needed
        this.battleArea = gameManager.getBattleArea(); this.battleArea.getComponent("BattleArea").init();
        this.TopUI = gameManager.getTopUI();
    },
    onReceiveCard: function(cardId, playerId){ //Xu ly khi nhan duoc the bai danh xuong tu nguoi choi co id = playerId
        //Process card Id
        var cardData = JARVIS.getCardData(cardId);
        var canDrop = this.checkOnDrop(cardId, cardData); //Kiem tra co the drop the duoc khong
        if (!canDrop) return;
        if(cardData == undefined) {cc.log(this.LOG_TAG, this.LANG.CARD_ID_NOT_CORRECT); return false;}

        this.DEBUG && cc.log(this.LOG_TAG, "[TEST_CARD_DATA]" ,JSON.stringify(cardData));

        // var trainer =this.battleArea.getComponent("BattleArea").getPlayerTrainer().getComponent("Trainer");
        // trainer.throwBall();
        switch(cardData.category){
            case this.CONST.CAT.POKEMON:
                this.processPKMCard(cardId);
        }
    },
    processPKMCard: function(cardId){
        cc.log("ProcessPKMCard");
        //Show Battle Slot avaiable
        var notifier = this.TopUI.getComponent("TopUI");
        notifier.notify("SELECTING..");
        battleAreaScr = this.battleArea.getComponent("BattleArea");
        battleAreaScr.showSelectabledUIs(cardId);
    },
    //Callback
    onPokeballOpen: function(){
        //Show pokemon
    },
    //Check
    checkOnDrop: function(cardId, cardData){
        var notifier = this.TopUI.getComponent("TopUI");
        var battleScr = this.battleArea.getComponent("BattleArea");
        var playerActiveSlotScr = battleScr.getPlayerActiveSlot().getComponent("BattleSlot");
        //var cardData = JARVIS.getCardData(cardId);
        cc.log("checK_on_drop",JSON.stringify(cardData));
        if(this.gameManager.isPhase(CONST.GAME_PHASE.START_GAME && cardData.category == CONST.CARD.CAT.PKM && cardData.evolution == CONST.CARD.EVOL.BASIC))
            return true;
        else{
            notifier.notify("YOU SHOULD DROP BASIC POKEMON CARD IN FIRST TURN", cc.Color.RED, 15);
        }
        
    },
});
