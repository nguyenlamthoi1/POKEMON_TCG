window.PLAYER_ID = 1;
window.OPPONENT_ID = 2;

const GAME_PHASE = {
    SETUP: -1,
    START: 0,
    RUN_TIME: 1,
    END_GAME: 2,
    ON_GAME_START: "ongamestart",
}
const GAMESTART_CONST = {
    NUM_DRAW: 5,
};

var fakeCard1 = [
    1,
    1,
    1,
    2,
    2,
    2
];
var Player = cc.Class({
    init: function (id, gameManager) {
        this._gm = gameManager;
        this._id = id;
        this._canDropCard = false;
        this._droppedEnergy = false;
        this._canUseMove = false;

        //For Debug
        
    },
    getId: function () { return this._id },
    sameId: function (id) { return this._id == id; },
    //Drop
    enableDrop: function (enabled) {
        this._canDropCard = enabled;
        this._gm.node.emit("droppable-changed", { id: this._id, enabled: this._canDropCard });
    },
    isDropEnabled: function () { return this._canDropCard; },
    registerEvent: function (eventType, cb, target) {
        this._gm.node.on(eventType, cb, target);
    },
    //--
    //Set
    setDroppedEnergy: function (dropped) { this._droppedEnergy = dropped; },
    enableUseMove: function (enable) { this._canUseMove = enable; },
    //Check
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

        //For Debug
        this.LOG_TAG = "[GM]";
        this._phase = {};
        this._phase[CONST.GAME_PHASE.START] = "START_PHASE";
        this._phase[CONST.GAME_PHASE.PLAY] = "PLAY_PHASE";

        const PLAYER_ID = 1;
        const OPPONENT_ID = 2;


        //Global var
        GM = this;
        //Init data
        this.player = {
            1: new Player(), // -> Player -> Device owner
            2: new Player() // -> Enemy, from other device
        }
        this.player[1].init(1, this);
        this.player[2].init(2, this);

        this.controllingPlayerId = this.player[1].getId(); //TODO: delete
        this.player1Cards = fakeCard1; //TODO: delete 
        //Init UI
        //-Init hands       
        this.hand = {};
        this.hand[PLAYER_ID] = this.handUI.getComponent("Hand");
        this.hand[PLAYER_ID].init(this.player[PLAYER_ID], this);
        
    },
    ready: function(){
        cc.log(this.clientId, "[ready]");
        this._client.node.once(CONST.EVENT.ON_GAME_START, this.start, this);
        this._client.sendRoomPackage(NW_REQUEST.CMD_ROOM_READY, {});
    },
    start: function(){

    },
    //CMD FROM SERVER
    processRoomCMD: function(pkg){
        cc.log(this.LOG_TAG, this.clientId, "[CLIENT_CMD_ROOM]", JSON.stringify(pkg));

        var cmdId = pkg.subCmd;
        switch (cmdId) {
            case NW_REQUEST.CMD_ROOM_START_PHASE: {
                //Set up data
                
                // goFirst: true,
                // player: {
                //     playerId: this.nextTurnPlayer.getId(),
                //     oppId: this.currentTurnPlayer.getId()
                // },
                // actions: [
                //     { type: CONST.ACTION.TYPE.DRAW, data: { player: this.currentTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW } },
                //     { type: CONST.ACTION.TYPE.DRAW, data: { player: this.nextTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW } },]
            
            }
            break;
        }
    },
});