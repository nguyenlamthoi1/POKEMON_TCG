
Processor = cc.Class({
    init: function (gameManager) {
        this.CONST = {
            CAT: {
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
        this.TopUI = gameManager.getTopUI();
        this.battleArea = gameManager.getBattleArea(); this.battleArea.getComponent("BattleArea").init(this.gameManager, this.TopUI.getComponent("TopUI"));
        this.notifier = this.TopUI.getComponent("TopUI");
        this.handUI = this.gameManager.handUI.getComponent("HandUI");
        //Get action processor
        this.actionProc = new ActionProcessor(); this.actionProc.init(this.gameManager,this, this.battleArea.getComponent("BattleArea"));
    },
    onReceiveCard: function (cardId, playerId) { //Xu ly khi nhan duoc the bai danh xuong tu nguoi choi co id = playerId
        //Process card Id
        var cardData = JARVIS.getCardData(cardId);
        var canDrop = this.checkOnDrop(cardId, cardData); //Kiem tra co the drop the duoc khong
        if (!canDrop) {
            this.handUI.onDropCardCancel();
            return;
        }


        if (cardData == undefined) { cc.log(this.LOG_TAG, this.LANG.CARD_ID_NOT_CORRECT); return false; }

        this.DEBUG && cc.log(this.LOG_TAG, "[TEST_CARD_DATA]", JSON.stringify(cardData));

        // var trainer =this.battleArea.getComponent("BattleArea").getPlayerTrainer().getComponent("Trainer");
        // trainer.throwBall();
        //cc.log("test_process", cardData.category, this.CONST.CAT.ENERGY);
        this.droppedCardId = cardId;
        switch (cardData.category) {
            case this.CONST.CAT.POKEMON:
                this.processPKMCard(cardId);
                break;
            case this.CONST.CAT.ENERGY:
                this.processEnergyCard(cardId);
                break;
        }

    },

    //--------PROCESS_CARD--------------
    processPKMCard: function (cardId) {

        cc.log("Process_card_pkm");
        //Show Battle Slot avaiable
        var notifier = this.TopUI.getComponent("TopUI");
        // notifier.notify("SELECTING");
        battleAreaScr = this.battleArea.getComponent("BattleArea");
        var selectData;
        if (this.gameManager.isPhase(CONST.GAME_PHASE.START)) {
            //START_TURN
            var playerActiveSlotScr = battleAreaScr.getPlayerActiveSlot().getComponent("BattleSlot");
            if (!playerActiveSlotScr.hasPokemon()) { //Should select empty active slot
                selectData = {
                    type: SELECTION.TYPE.PLAYER_EMPTY_ACTIVE,
                    selectNum: 1,
                    callbackType: SELECTION.CB_TYPE.SHOW_PKM,
                    action: {
                        actionType: GAME_ACTION.TYPE.SUMMON_A_POKEMON
                    }
                };
            } else {
                selectData = {
                    type: SELECTION.TYPE.PLAYER_EMPTY_BENCH,
                    selectNum: 1,
                    callbackType: SELECTION.CB_TYPE.SHOW_PKM,
                    action: {
                        actionType: GAME_ACTION.TYPE.SUMMON_A_POKEMON
                    }
                };
            }
        } else {
            //PLAY_TURN
            selectData = {
                type: SELECTION.TYPE.PLAYER_ALL_PKM,
                callbackType: SELECTION.CB_TYPE.EVOL_POKEMON
            };
        }
        if (selectData != undefined) {
            cc.log("ProcessPKMCard2", cardId);
            this.gameManager.node.once(CONST.GAME_PHASE.ON_SELECT_CANCEL, this.onCardCancel, this);
            this.gameManager.node.once(CONST.GAME_PHASE.ON_SELECT_DONE, this.onSelectDone, this);
            battleAreaScr.showSelectabledUIs(cardId, selectData);
        }
        this.selectData = selectData;
    },
    processEnergyCard: function (cardId) {

        cc.log(this.LOG_TAG, "Process_card_energy");
        //Show Battle Slot avaiable
        var notifier = this.TopUI.getComponent("TopUI");
        notifier.notify("SELECTING..");
        battleAreaScr = this.battleArea.getComponent("BattleArea");
        var selectData;
        if (this.gameManager.isPhase(CONST.GAME_PHASE.START)) {

        } else {
            //PLAY PHASE
            selectData = {
                type: SELECTION.TYPE.PLAYER_ALL_PKM,
                callbackType: SELECTION.CB_TYPE.SHOW_PKM,

            };
        }
        if (selectData != undefined) {
            cc.log("listen_event", cardId);
            this.gameManager.node.once(CONST.GAME_PHASE.ON_SELECT_CANCEL, this.onCardCancel, this);
            this.gameManager.node.once(CONST.GAME_PHASE.ON_SELECT_DONE, this.onSelectDone, this);
            battleAreaScr.showSelectabledUIs(cardId, selectData);
        }

    },
    //--------END_PROCESS_CARD-----------

    onCardCancel: function (cardId) {
        cc.log("test_cancel_fact");
        this.handUI.onDropCardCancel();
    },
    onCardApproved: function () {
        //this.gameManager.node.off(CONST.GAME_PHASE.ON_SELECT_CANCEL, this.onCardCancel, this);
        this.handUI.onDropCardApproved();
    },
    onSelectDone: function (event) {
        cc.log("PROCESS_SELECTING", JSON.stringify(this.selectData), event.para.length);
        this.actionProc.process(this.selectData.action.actionType,  this.droppedCardId ,event.para);
    },

    //Check
    checkOnDrop: function (cardId, cardData) {
        var notifier = this.TopUI.getComponent("TopUI");
        var battleScr = this.battleArea.getComponent("BattleArea");
        var playerActiveSlotScr = battleScr.getPlayerActiveSlot().getComponent("BattleSlot");
        if (cardData == undefined) cardData = JARVIS.getCardData(cardId);
        // cc.log("checK_on_drop1", cardData.evolution, CONST.CARD.EVOL.BASIC );
        // cc.log("checK_on_drop2", JSON.stringify(cardData));
        //cc.log("test_check_drop",this.gameManager.currentPhase, CONST.GAME_PHASE.START,cardData.category,  cardData.evolution, cardData.id);
        if (this.gameManager.isPhase(CONST.GAME_PHASE.START)) {
            if (cardData.category == CONST.CARD.CAT.PKM && cardData.evolution == CONST.CARD.EVOL.BASIC) {
                return true;
            }
            else {
                notifier.notify("YOU SHOULD DROP BASIC POKEMON CARD IN FIRST TURN", cc.Color.RED, 15);
                return false;
            }
        }
        else {

        }
        return true;
    },
    checkEndTurn: function () {
        var battleScr = this.battleArea.getComponent("BattleArea");
        if (this.gameManager.isPhase(CONST.GAME_PHASE.START) && battleScr.playerHasActivePkm()) {
            return true;
        }
        else {
            this.notifier.notify("YOU SHOULD HAVE POKEMON\n AT ACTIVE SLOT", cc.Color.RED, 20, 3);
            return false;
        }
    }
});

var ActionProcessor = cc.Class({
    init(gm, mainProc, battleArea) {
        this.gm = gm;
        this.mainProc = mainProc;
        this.battleArea = battleArea;
    },
    process: function (actionType, cardId, para) {
        cc.log("actionType", actionType, GAME_ACTION.TYPE.SUMMON_A_POKEMON);
        switch (actionType) {
            case GAME_ACTION.TYPE.SUMMON_A_POKEMON:
                {
                    //SummonPKM
                    this.battleArea.summonPokemon(para[0], cardId);
                    //Notify selection done
                    this.mainProc.onCardApproved();
                }
                break;

        }
    }
});