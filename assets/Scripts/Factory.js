
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
        this._battleArea = gameManager.get_BattleArea(); this._battleArea.getComponent("BattleArea").init(this.gm, this.TopUI.getComponent("TopUI"));
        this.battleArea = gameManager.getBattleArea();
        this.notifier = this.TopUI.getComponent("TopUI");
        this.handUI = this.gm.handUI.getComponent("HandUI");

        //Get action processor
        this.actionProc = new ActionProcessor(); this.actionProc.init(this.gm, this, this.battleArea);
    },
    onReceiveCard: function (cardId, player) { //Xu ly khi nhan duoc the bai danh xuong tu nguoi choi co id = playerId
        cc.log("on_drop_card_0", JARVIS.getCardName(cardId), player.getId());
        var hand = this.gm.getHandOfCurrentPlayer();
        //Pre check
        var cardData = JARVIS.getCardData(cardId);
        var canDrop = this.checkOnDrop(cardId, cardData, player); //Kiem tra co the drop the duoc khong
        if (!canDrop) { //failed to drop
            hand.onDropCardCancel();
            return false;
        }
        if (cardData == undefined) { //Cannot retrieve data of card
            cc.log(this.LOG_TAG, this.LANG.CARD_ID_NOT_CORRECT);
            hand.onDropCardCancel();
            return false;
        }
        this.DEBUG && cc.log(this.LOG_TAG, "[DROP_CARD_DATA]", JSON.stringify(cardData));
        //--
        this.droppedCardId = cardId;
        switch (cardData.category) {
            case this.CONST.CAT.POKEMON:
                this.processPKMCard(cardId, player);
                break;
            case this.CONST.CAT.ENERGY:
                this.processEnergyCard(cardId, player);
                break;
        }

    },

    //--------PROCESS_CARD--------------
    processPKMCard: function (cardId, player) {
        if (player == undefined) player = this.gm.getCurrentPlayer();
        cc.log(this.LOG_TAG, "PROCESS_CARD_POKEMON", JARVIS.getCardName(cardId), player.getId());
        //Show Battle Slot avaiable
        var activeSlot = this.battleArea.getActiveSlotOf(player.getId());
        var selectData;
        if (this.gm.isPhase(CONST.GAME_PHASE.START)) {
            //START_TURN
            if (!activeSlot.hasPokemon()) { //Should select empty active slot
                selectData = {
                    type: SELECTION.TYPE.PLAYER_EMPTY_ACTIVE,
                    selectNum: 1,
                    callbackType: SELECTION.CB_TYPE.SHOW_PKM,
                    action: {
                        actionType: GAME_ACTION.TYPE.SUMMON_A_POKEMON
                    }
                };
            } else { //Should select the first empty slot on Bench
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
            this.battleArea.showSelectabledUIs(selectData, cardId, player);
        }
        this.selectData = selectData;
    },
    processEnergyCard: function (cardId) {

        cc.log(this.LOG_TAG, "Process_card_energy");
        //Show Battle Slot avaiable
        var notifier = this.TopUI.getComponent("TopUI");
        notifier.notify("SELECTING..");
        battleAreaScr = this._battleArea.getComponent("BattleArea");
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
            else {
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

    onCardCancel: function () {
        this.gm.getHandOfCurrentPlayer().onDropCardCancel();
    },
    onCardApproved: function () {
        this.gm.getHandOfCurrentPlayer().onDropCardApproved();
    },
    onSelectDone: function (event) {
        cc.log("PROCESS_SELECTING", JSON.stringify(this.selectData), event.para.length);
        this.actionProc.process(this.selectData.action.actionType, this.droppedCardId, event.para);
    },
    onUsedMove: function (player, move, fromSlot) {
        //var isMoveActive = this.checkOnUsingMove(player, move, fromSlot); //TODO: No need, cuz we have checked before
        cc.log("test_on_used_move", JSON.stringify(move));
        this.actionProc.processMove(player, move.moveData, fromSlot);
    },

    //Check
    checkOnDrop: function (cardId, cardData, player) {
        var notifier = this.TopUI.getComponent("TopUI");
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
    checkEndTurn: function (player) {
        cc.log(this.LOG_TAG, "CHECK_END_TURN", this.gm.isPhase(CONST.GAME_PHASE.START), this.battleArea.hasActivePkm(player));
        if (this.gm.isPhase(CONST.GAME_PHASE.START)) {
            if (this.battleArea.hasActivePkm(player)) {
                return true;
            }
            else {
                this.notifier.notify("YOU SHOULD HAVE A POKEMON\n AT ACTIVE SLOT", cc.Color.RED, 20, 3);
                return false;
            }
        }

    },
    checkOnUsingMove: function (player, move, fromSlot) {
        cc.log("proc_Check_move", this.gm.getCurrentPlayer().getId(), player.getId());
        if (this.gm.getCurrentPlayer().sameId(player.getId())) {
            cc.log("proc_Check_move1", this.gm.isPlayPhase(), this.gm.getCurrentTurn());
            if (this.gm.isPlayPhase() && this.gm.getCurrentTurn() > 0) {
                this.a = player.canUseMove();
                this.b = fromSlot.isEnoughEnergy(move.moveIdx);
                cc.log("proc_Check_move2", this.a, this.b);
                if (this.a && this.b) {
                    return true;
                }
            }

        }
        return false;
    }
});

var ActionProcessor = cc.Class({
    init(gm, mainProc, battleArea) {
        this.gm = gm;
        this.mainProc = mainProc;
        this.battleArea = battleArea;
    },
    process: function (actionType, cardId, para) {
        cc.log("PROCESS_ACTION_TYPE", actionType, GAME_ACTION.TYPE.SUMMON_A_POKEMON, para.length, cardId);
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
    },
    processMove: function (player, moveData, fromSlot) {
        //{"moveId":"M0","actions":{"A0":{"valueType":0,"value":20}},"name":"Leech Seed","cost":{"grass":2},"value":"20","des":""}

        cc.log("PROC_ON_USED_MOVE", JSON.stringify(moveData));
        this._actionQueue = [];
        for (const action in moveData.actions) {
            cc.log("TEST_ACTION", action);
            this._actionQueue.push({ id: action, data: moveData.actions[action] });
            // switch (action){
            //     case GAME_ACTION.ATTACK_OPP_ACTIVE_POKEMON:{

            //         break;
            //     }
            // }
        }

        this._processActionInQueue(); //Start process from the first action and wait

    },
    _processActionInQueue: function () {
        if (this._actionQueue.length > 0) {//If we still have action
            var action = this._actionQueue.shift();
            cc.log("START_PROCESS", JSON.stringify(action));
            this._isProcActionFinished = false; //we start processing new action
            switch (action.id) {
                case GAME_ACTION.ATTACK_OPP_ACTIVE_POKEMON: {
                    this.battleArea.attackOppActive();
                    break;
                }
            }
        }
    }
});