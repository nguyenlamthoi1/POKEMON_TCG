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
        if(this.clientId == "client_1"){
            this.board = this.boardUI.getComponent("Board");
            this.board.init(this);
        }
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
        switch (cmdId) {
            case NW_REQUEST.CMD_ROOM_START_PHASE: {
                cc.log("CMD_ROOM_START_PHASE", this.clientId, JSON.stringify(data));
                //Set up data
                this.playerId = data.player.playerId;
                this.oppId = data.player.oppId;

                this.player[PLAYER_ID].setFirstPlay(data.goFirst);
                this.player[OPPONENT_ID].setFirstPlay(!data.goFirst);

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
            }
                break;
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
                }
                    break;
            }
            this.node.once(CONST.ACTION.EVENT.ON_FINISH, this.on1ActionFinish.bind(this));
        }
    },
    on1ActionFinish: function () {
        cc.log("process_next_action");
        this.processActionQ(); //When an UI action finish then keep do next action
    },
    //--------------
    //Drag and Drop Card
    onDropCard: function(cardId){
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
    processPKMCard : function (cardId) {
        cc.log(this.LOG_TAG, "PROCESS_CARD_POKEMON", JARVIS.getCardName(cardId));
        //Show Battle Slot avaiable
        if (this.isPhase(CONST.GAME_PHASE.START)) {//IF CURRENT PHASE IS START PHASE
            if (!this.board.playerHasActivePKM(PLAYER_ID)) { //USER NOT HAVE POKEMON AT ACTIVE POSITION
               this.board.enabledSelectActive(true);
               return true;
            } 
            else { //Should select the first empty slot on Bench
                this.board.enabledSelectActive(true);
                return false;
            }
        } else {
            return false;
        }
        return false;
    },
    //-------------
    //Get
    getClientId: function () { return this.clientId; },
    getBoard: function(){return this.board;},
    //Check
    isPhase: function (phase) { return this.currentPhase == phase; },
});