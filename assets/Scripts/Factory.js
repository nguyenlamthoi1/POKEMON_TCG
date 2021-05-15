
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

        this.gm = gameManager;
        //Get all UIs needed
        this.TopUI = gameManager.getTopUI();
        this.battleArea = gameManager.getBattleArea(); this.battleArea.getComponent("BattleArea").init(this.gm, this.TopUI.getComponent("TopUI"));
        this.notifier = this.TopUI.getComponent("TopUI");
        this.handUI = this.gm.handUI.getComponent("HandUI");
        //Get action processor
        this.actionProc = new ActionProcessor(); this.actionProc.init(this.gm, this, this.battleArea.getComponent("BattleArea"));
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
        if (this.gm.isPhase(CONST.GAME_PHASE.START)) {
            //START_TURN
            var playerActiveSlotScr = battleAreaScr.getPlayerActiveSlot().getComponent("BattleSlot");
            if (!playerActiveSlotScr.hasPokemon()) { //Should select empty active slot
                cc.log("SELEC_EMPTY_ACTIVE");
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
            if (JARVIS.isBasicPokemonCard(cardId)) {
                cc.log("break1");
                selectData = {
                    type: SELECTION.TYPE.PLAYER_EMPTY_BENCH,
                    selectNum: 1,
                    callbackType: SELECTION.CB_TYPE.SHOW_PKM,
                    action: {
                        actionType: GAME_ACTION.TYPE.SUMMON_A_POKEMON
                    }
                };
            } else {
                selectData = {
                    type: SELECTION.TYPE.ALL_PKM_TO_EVOLVE,
                    callbackType: SELECTION.CB_TYPE.EVOL_POKEMON,
                    selectNum: 1,
                    action: {
                        actionType: GAME_ACTION.TYPE.EVOLVE_A_POKEMON
                    }
                };
            }

        }
        if (selectData != undefined) {
            cc.log("ProcessPKMCard2", cardId);
            this.gm.node.once(CONST.GAME_PHASE.ON_SELECT_CANCEL, this.onCardCancel, this);
            this.gm.node.once(CONST.GAME_PHASE.ON_SELECT_DONE, this.onSelectDone, this);
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
        if (this.gm.isPhase(CONST.GAME_PHASE.START)) {

        }
        else {
            //Check if energy card can drop or not
            var currentPlayer = this.gm.getCurrentPlayer();
            if (!currentPlayer.droppedEnergy()) {
                //PLAY PHASE
                selectData = {
                    type: SELECTION.TYPE.PLAYER_ALL_PKM,
                    selectNum: 1,
                    callbackType: SELECTION.CB_TYPE.SHOW_PKM,
                    action: {
                        actionType: GAME_ACTION.TYPE.ATTACH_ENERGY
                    }
                };
            }
            else{
                this.onCardCancel();
            }

        }
        if (selectData != undefined) {
            cc.log("listen_event", cardId);
            this.gm.node.once(CONST.GAME_PHASE.ON_SELECT_CANCEL, this.onCardCancel, this);
            this.gm.node.once(CONST.GAME_PHASE.ON_SELECT_DONE, this.onSelectDone, this);
            battleAreaScr.showSelectabledUIs(cardId, selectData);
        }
        this.selectData = selectData;

    },
    //--------END_PROCESS_CARD-----------

    onCardCancel: function (cardId) {
        cc.log("test_cancel_fact");
        this.handUI.onDropCardCancel();
    },
    onCardApproved: function () {
        //this.gm.node.off(CONST.GAME_PHASE.ON_SELECT_CANCEL, this.onCardCancel, this);
        this.handUI.onDropCardApproved();
    },
    onSelectDone: function (event) {
        cc.log("PROCESS_SELECTING", JSON.stringify(this.selectData), event.para.length);
        this.actionProc.process(this.selectData.action.actionType, this.droppedCardId, event.para);
    },

    //Check
    checkOnDrop: function (cardId, cardData) {
        var notifier = this.TopUI.getComponent("TopUI");
        var battleScr = this.battleArea.getComponent("BattleArea");
        var playerActiveSlotScr = battleScr.getPlayerActiveSlot().getComponent("BattleSlot");
        if (cardData == undefined) cardData = JARVIS.getCardData(cardId);
        // cc.log("checK_on_drop1", cardData.evolution, CONST.CARD.EVOL.BASIC );
        // cc.log("checK_on_drop2", JSON.stringify(cardData));
        //cc.log("test_check_drop",this.gm.currentPhase, CONST.GAME_PHASE.START,cardData.category,  cardData.evolution, cardData.id);
        if (this.gm.isPhase(CONST.GAME_PHASE.START)) {
            if (JARVIS.isBasicPokemonCard(cardId)) {
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
        cc.log('test_end_turn', this.gm.isPhase(CONST.GAME_PHASE.START), battleScr.playerHasActivePkm());
        if (this.gm.isPhase(CONST.GAME_PHASE.START)) {
            if (battleScr.playerHasActivePkm()) {
                return true;
            }
            else {
                this.notifier.notify("YOU SHOULD HAVE POKEMON\n AT ACTIVE SLOT", cc.Color.RED, 20, 3);
                return false;
            }
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
        cc.log("actionType", actionType, GAME_ACTION.TYPE.SUMMON_A_POKEMON, para.length, cardId);
        switch (actionType) {
            case GAME_ACTION.TYPE.SUMMON_A_POKEMON:
                {
                    //SummonPKM
                    this.battleArea.summonPokemon(para[0], cardId);
                    //Notify selection done
                    this.mainProc.onCardApproved();
                }
                break;
            case GAME_ACTION.TYPE.EVOLVE_A_POKEMON:
                {
                    //SummonPKM
                    this.battleArea.evolvePokemon(para[0], cardId);
                    //Notify selection done
                    this.mainProc.onCardApproved();
                }
                break;
            case GAME_ACTION.TYPE.ATTACH_ENERGY:
                {
                    //SummonPKM
                    this.battleArea.attachEnergy(para[0], cardId);
                    //Notify selection done
                    this.mainProc.onCardApproved();
                }
                break;

        }
    }
});