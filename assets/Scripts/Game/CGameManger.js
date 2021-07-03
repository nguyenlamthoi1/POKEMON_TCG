window.PLAYER_ID = 1;
window.OPPONENT_ID = 2

var Player = cc.Class({
    init: function (id, gm) {
        this._gm = gm;
        this._id = id;
        this._enabledDropCard = false; //Co kha nang drop card hay khong
        this._enabledUseEnergy = false; //Co kha nang drop energy card hay khong
        this._enabledUseMove = false; //Co kha nang su dung move hay khong
    },
    setFirstPlay: function (goFirst) {
        this.setDropCardEnabled(goFirst);
        this.setUseEnergyEnabled(false);
        this.setUseMoveEnabled(false);
    },

    //Get
    getId: function () { return this._id; },
    //Set
    setDropCardEnabled: function (enabled) { this._enabledDropCard = enabled; },
    setUseEnergyEnabled: function (enabled) { this._enabledUseEnergy = enabled; },
    setUseMoveEnabled: function (enabled) { this._enabledUseMove = enabled; },
    registerEvent: function (eventType, cb, target) {
        this._gm.node.on(eventType, cb, target);
    },
    //Check
    isSameId: function (id) { return this._id == id; },
    isOpponent: function () {
        return !this.sameId(this._gm.controllingPlayerId);
    },
    droppedEnergy: function () {
        return this._droppedEnergy;
    },
    canUseMove: function () { return this._canUseMove; }
}
);
window.GM = null;

cc.Class({
    extends: cc.Component,

    properties: {
        controllingPlayerId: -1,
        player1Id: -1,
        player2Id: -1,
        player1Cards: [],
        player2Cards: [],

        clientId: "client_1",

        //nodes in Top UI
        handUI: cc.Node,
        oppHandUI: cc.Node,
        notify: cc.Label,
        //nodes in Board UI
        boardUI: cc.Node,

        //Versus UI
        versusUI: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.LOG_TAG = "[CLIENT_GM]";
        this._client = CLIENT_MGR.getClient(this.clientId);
        this._client.setGameManager(this);
        const DELAY_VS = 2.5;
        this.versusUI.getComponent("VersusUI").show(DELAY_VS, this.ready.bind(this));
        //this.schedule(this.ready.bind(this), 0, 0, DELAY_VS);

        //JARVIS = new DataManager(); JARVIS.init()//Data Manager
        //JARVIS.load();

        //Action
        this._actionQ = [];
        this._actionFinished = false;

        //For Debug
        this.LOG_TAG = "[GM]";
        this._phase = {};
        this._phase[CONST.GAME_PHASE.START] = "START_PHASE";
        this._phase[CONST.GAME_PHASE.PLAY] = "PLAY_PHASE";

        //Init data
        this.player = {};
        this.player[PLAYER_ID] = new Player(); // -> Player -> Device owner
        this.player[OPPONENT_ID] = new Player();
        this.player[PLAYER_ID].init(PLAYER_ID, this);
        this.player[OPPONENT_ID].init(OPPONENT_ID, this);

        //this.controllingPlayerId = this.player[1].getId(); //TODO: delete
        //Init UI
        // -Init Board

        this.board = this.boardUI.getComponent("Board");
        this.board.init(this);

        //-Init hands       
        this.hand = {};
        this.hand[PLAYER_ID] = this.handUI.getComponent("Hand");
        this.hand[PLAYER_ID].init(this.player[PLAYER_ID], this);
        this.hand[OPPONENT_ID] = this.oppHandUI.getComponent("Hand");
        this.hand[OPPONENT_ID].init(this.player[OPPONENT_ID], this);



        //Collider
        this._colliderMgr = cc.director.getCollisionManager();
        this._colliderMgr.enabled = true;
        this._colliderMgr.enabledDebugDraw = true;
        
        //Notify
       

    },
    noti(text, delay){
        this.notify.string = text;
        
        Utils.doPop(this.notify.node.parent.parent, 0.5, 0.2, 1);
        if(delay != undefined)
            this.scheduleOnce(function(){Utils.doUnPop(this.notify.node.parent.parent, 0.5, 1, 0.2)}.bind(this), delay);
    },
    ready: function () {
        cc.log(this.clientId, "[ready]");
        this._client.node.once(CONST.EVENT.ON_GAME_START, this.start, this);
        this._client.sendRoomPackage(NW_REQUEST.CMD_ROOM_READY, {});
    },
    onPhaseStart: function () {

    },
    changePhase: function (phase) {
        this.currentPhase = phase;
        switch (phase) {
            case CONST.GAME_PHASE.START:
                this.node.emit(CONST.GAME_PHASE.ON_GAME_START, phase);
            case CONST.GAME_PHASE.PLAY:
                this.node.emit(CONST.GAME_PHASE.ON_GAME_START_PLAY, phase);
        }
        cc.log(this.LOG_TAG, "PHASE:", this._phase[phase]);
    },
    //CMD FROM SERVER
    processRoomCMD: function (pkg) {
        cc.log(this.LOG_TAG, this.clientId, "[CLIENT_CMD_ROOM]", JSON.stringify(pkg));

        var cmdId = pkg.subCmd;
        var data = pkg.data;
        //Process match data


        switch (cmdId) {
            case NW_REQUEST.CMD_ROOM_START_PHASE: {
                cc.log("CMD_ROOM_START_PHASE", this.clientId, JSON.stringify(data));
                //Set up data
                this._client.setPlayerId(data.player.playerId);
                this.playerId = data.player.playerId;
                this.oppId = data.player.oppId;

                this.player[PLAYER_ID].setFirstPlay(data.goFirst);
                this.player[OPPONENT_ID].setFirstPlay(!data.goFirst);
                
                if(data.goFirst){
                    this.currentPlayer = this.player[PLAYER_ID];
                    this.nextPlayer = this.player[OPPONENT_ID];
                }else{
                    this.currentPlayer = this.player[OPPONENT_ID];
                    this.nextPlayer = this.player[PLAYER_ID];
                }

                this.changePhase(CONST.GAME_PHASE.START);
                this.turnCount = 0;

                this.addAction(data.actions);
                this.processActionQ();
                // goFirst: true,
                // player: {
                //     playerId: this.nextTurnPlayer.getId(),
                //     oppId: this.currentTurnPlayer.getId()
                // },
                // actions: [
                //     { type: CONST.ACTION.TYPE.DRAW, data: { player: this.currentTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW } },
                //     { type: CONST.ACTION.TYPE.DRAW, data: { player: this.nextTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW } },]
                this.versusUI.getComponent("VersusUI").hide();
                break;
            }
            case NW_REQUEST.CMD_ROOM_DO_ACTION: {
                this.addAction(data.actions);
                this.processActionQ();
                break;
            }
        }
    },
    //--------------
    //PROCESS ACTION
    isPlayerAction: function (action) {
        return this.playerId == action.data.player;
    },
    getPIDOfAction: function (action) {
        if (this.playerId == actionData.data.player)
            return PLAYER_ID;
        else
            return OPPONENT_ID;
    },
    addAction: function (actions) {
        while (actions.length > 0) {
            this._actionQ.push(actions.pop());
        }
    },
    processActionQ: function () {
        
        if (this._actionQ.length > 0) {
            var action = this._actionQ.pop();
            switch (action.type) {
                case CONST.ACTION.TYPE.DRAW: {
                    cc.log("PROCESS_ACTION", "DRAW", JSON.stringify(action));
                    if (this.isPlayerAction(action)) {
                        this.hand[PLAYER_ID].draw(action.data.list, false, action.data.numDraw);
                    } else {
                        this.hand[OPPONENT_ID].draw(action.data.list, true, action.data.numDraw);
                    }
                    break;
                }
                case CONST.ACTION.TYPE.PLAY_CARD: {
                    if (this.isPlayerAction(action)) {
                        //this.board[PLAYER_ID].playerDropCard(action.data.idxHand, action.data.cardId, action.data.dropPlace);
                    } else {
                        this.board.oppDropCard(action.data.idxHand, action.data.cardId, action.data.dropPlace);
                    }
                    break;
                }
                case CONST.ACTION.TYPE.END_TURN: {
                    this.endTurn();
                    break;
                }
            }
            this.node.once(CONST.ACTION.EVENT.ON_FINISH, this.on1ActionFinish.bind(this));
        }
    },
    on1ActionFinish: function () {
        cc.log("process_next_action");
        this.processActionQ(); //When an UI action finish then keep do next action
    },
    //--------------
    onDropCard: function (cardId) {
        cc.log("receiveCard", JARVIS.getCardName(cardId), cardId);
        //this.board.receiveCard(cardId);
    },
    showSelectable: function (cardId) {
        cc.log(this.LOG_TAG, "SHOW_SELECTABLE", JARVIS.getCardName(cardId));
        var hand = this.hand[PLAYER_ID];
        var cardData = JARVIS.getCardData(cardId);
        var ret = false;;
        switch (cardData.category) {
            case CONST.CARD.CAT.PKM:
                ret = this.processPKMCard(cardId);
                break;
            case CONST.CARD.CAT.ENERGY:
                ret = this.processEnergyCard(cardId);
                break;
        }
        return ret;

    },
    processPKMCard: function (cardId) {
        
        //Show Battle Slot avaiable
        if (this.isPhase(CONST.GAME_PHASE.START)) {//IF CURRENT PHASE IS START PHASE
            if(!JARVIS.isBasicPokemonCard(cardId)) return false;
            if (!this.board.playerHasActivePKM(PLAYER_ID)) { //USER NOT HAVE POKEMON AT ACTIVE POSITION
                this.board.enableSelectActive(true);
                this.board.enableSelectBench(false);
                return true;
            }
            else { //Should select the first empty slot on Bench
                if (!this.board.playerHasFullBench()) {
                    this.board.enableSelectActive(false);
                    this.board.enableSelectBench(true);
                    return true;
                }
                else
                    return false;
            }
        } else {
            return false;
        }
        return false;
    },
    //-------------
    //ACTION
    endTurn: function(){
       if(this.isPlayerTurn()){
           this.notify("YOUR TURN", 1);
       }else{
            this.notify("OPPONENT'S TURN", 1);
       }
    },
    //----
    //Get
    getClientId: function () { return this.clientId; },
    getBoard: function () { return this.board; },
    getClient: function () { return this._client; },
    getHand: function (id) { return this.hand[id]; },
    //Check
    isPhase: function (phase) { return this.currentPhase == phase; },
    isPlayerTurn: function(){return this.currentPlayer.getId() == this.player[PLAYER_ID]},
});