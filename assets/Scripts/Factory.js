
Processor = cc.Class({
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
        this.battleArea = gameManager.getBattleArea(); this.battleArea.getComponent("BattleArea").init(this.gameManager);
        this.TopUI = gameManager.getTopUI();
        this.notifier = this.TopUI.getComponent("TopUI");
    },
    onReceiveCard: function(cardId, playerId){ //Xu ly khi nhan duoc the bai danh xuong tu nguoi choi co id = playerId
        //Process card Id
        var cardData = JARVIS.getCardData(cardId);
        var canDrop = this.checkOnDrop(cardId, cardData); //Kiem tra co the drop the duoc khong
        cc.log("test_Drop1");
        if (!canDrop) return;
        cc.log("test_Drop2");

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
        var selectData;
        if(this.gameManager.isPhase(CONST.GAME_PHASE.START_GAME)){
            //START_TURN
            var playerActiveSlotScr = battleAreaScr.getPlayerActiveSlot().getComponent("BattleSlot");
            if(!playerActiveSlotScr.hasPokemon()){ //Should select empty active slot
                selectData = {
                    type: SELECTION.TYPE.PLAYER_EMPTY_ACTIVE,
                    selectNum: 1,
                    callbackType: SELECTION.CB_TYPE.SHOW_PKM
                };
            }else{
                selectData = {
                    type: SELECTION.TYPE.PLAYER_EMPTY_BENCH,
                    selectNum: 1,
                    callbackType: SELECTION.CB_TYPE.SHOW_PKM
                };
            }
        }else{
            //PLAY_TURN
        }
        if(selectData != undefined)
            battleAreaScr.showSelectabledUIs(cardId,selectData);

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
        if(cardData == undefined) cardData = JARVIS.getCardData(cardId);
        cc.log("checK_on_drop1", cardData.evolution, CONST.CARD.EVOL.BASIC );
        cc.log("checK_on_drop2", JSON.stringify(cardData));

        if(this.gameManager.isPhase(CONST.GAME_PHASE.START_GAME) 
            && cardData.category == CONST.CARD.CAT.PKM && cardData.evolution == CONST.CARD.EVOL.BASIC){
                return true;
            }
        else{
            notifier.notify("YOU SHOULD DROP BASIC POKEMON CARD IN FIRST TURN", cc.Color.RED, 15);
            return false;
        }
    },
    checkEndTurn: function(){
        var battleScr = this.battleArea.getComponent("BattleArea");
        if(this.gameManager.isPhase(CONST.GAME_PHASE.START_GAME) && battleScr.playerHasActivePkm()){
                return true;
            }
        else{
            this.notifier.notify("YOU SHOULD HAVE POKEMON\n AT ACTIVE SLOT", cc.Color.RED, 20, 3);
            return false;
        }
    }
});
