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
        currentPhase: GAME_PHASE.SETUP,
        testNode: cc.Sprite,

        //nodes in Top UI
        handUI: cc.Node,
        oppHandUI: cc.Node,
        battleAreaNode: cc.Node,
        topUINode: cc.Node,
        notifier: cc.Node,
        //Versus UI
        versusUI: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //For Debug
        this.LOG_TAG = "[GM]";
        this._phase = {};
        this._phase[CONST.GAME_PHASE.START] = "START_PHASE";
        this._phase[CONST.GAME_PHASE.PLAY] = "PLAY_PHASE";

        const PLAYER_ID = 1;
        const OPPONENT_ID = 2;
        const DELAY_VS = 2.5;


        this.versusUI.getComponent("VersusUI").show(DELAY_VS);
        this.schedule(this.startGame.bind(this), 0, 0, DELAY_VS);
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
        this.hand[PLAYER_ID] = this.handUI.getComponent("HandUI");
        this.hand[PLAYER_ID].init(this.player1Cards, this.player[PLAYER_ID], this);
        this.hand[OPPONENT_ID] = this.oppHandUI.getComponent("HandUI");
        this.hand[OPPONENT_ID].init(this.player2Cards, this.player[OPPONENT_ID], this);

        this.processor = new Processor(); this.processor.init(this);

        this.topUIScr = this.topUINode.getComponent("TopUI"); this.topUIScr.init(this, this.player[1]);

        //Listen to events
        this.node.on(CONST.GAME_PHASE.ON_GAME_START, this.onGameStart, this);
        this.node.on(CONST.GAME_PHASE.ON_TURN_START, this.onTurnStart, this);
        this.node.on(CONST.GAME_PHASE.ON_TURN_END, this.onTurnEnd, this);


    },
    startGame() {
        this.changePhase(CONST.GAME_PHASE.START); //TODO: wait server notify START_GAME;
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
    changeTurn: function (phase) {//Start a new turn
        //--Set up before run new turn
        //Swap turn id
        var temp = this.currentTurnPlayer;
        this.currentTurnPlayer = this.nextTurnPlayer;
        this.nextTurnPlayer = temp;
        this.turnCount++;

        //Set up data for current player
        //this.currentTurnPlayer.setDroppedEnergy(false);

        //Player can drop
        this.player[PLAYER_ID].enableDrop(this.player[PLAYER_ID].sameId(this.currentTurnPlayer.getId())); //Player can drop or not
        this.player[OPPONENT_ID].enableDrop(this.player[OPPONENT_ID].sameId(this.currentTurnPlayer.getId()));
        
        //Player can use move
        //this.player[1].enableUseMove(this.player[1].sameId(this.currentTurnPlayer.getId()));

        //Start play phase if start phase is done
        if (this.isPhase(CONST.GAME_PHASE.START) && this.turnCount == 2) {//If we pass 2 set up active pkm turn then start play phase
            this.turnCount = 0;
            this.changePhase(CONST.GAME_PHASE.PLAY);
        }
        //--Done Set up 
        //launch Event
        this.node.emit(CONST.GAME_PHASE.ON_TURN_START, { player: this.currentTurnPlayer });
        //Debug
        cc.log(this.LOG_TAG, "TURN: ", this.turnCount, "PLAYER: ", this.currentTurnPlayer.getId());


    },
    isPhase: function (phase) { return this.currentPhase == phase; },
    onGameStart: function () {
        cc.log("ON_GAME_START");
        //YOU ALWAYS GO FIRST
        //Set first turn
        this.turnCount = 0;
        this.currentTurnPlayer = this.player[1];
        this.nextTurnPlayer = this.player[2];
        //Draw first cards
        this.hand[PLAYER_ID].draw(GAMESTART_CONST.NUM_DRAW);
        this.hand[OPPONENT_ID].draw(GAMESTART_CONST.NUM_DRAW); //TODO: dont reveal cards

        //setTimeout(function(){this.handUI.getComponent("HandUI").draw(GAMESTART_CONST.NUM_DRAW)}.bind(this),1);
        //Notify
        var topUIScr = this.topUINode.getComponent("TopUI");
        topUIScr.notify("DROP YOUR ACTIVE POKEMON", cc.Color.WHITE, 20);
        //Show selectable Area If first turn belong to us(Player not Enemy)
        if (this.isPlayerTurn()) {
            this.player[PLAYER_ID].enableDrop(true); //Player can drop
            this.player[OPPONENT_ID].enableDrop(false);
        } else {
            this.player[OPPONENT_ID].enableDrop(true); //Player can't drop
            this.player[PLAYER_ID].enableDrop(false);
        }

        this.node.emit(CONST.GAME_PHASE.ON_TURN_START, { player: this.player[1] });

    },
    onTurnStart: function () {

    },
    onTurnEnd: function () { },
    endTurn: function (player) {
        //Check end turn
        if (this.processor.checkEndTurn(player) === false) {
            return;
        }
        cc.log("checkEndturn_true");

        //Change turn
        this.node.emit(CONST.GAME_PHASE.ON_TURN_END, { player: this.currentTurnPlayer });
        this.changeTurn();
    },
    onDropCard: function (cardId, player) {
        //Kiem tra so bo player co duoc phep drop card
        cc.log("DROP_CARD_1", cardId, player.getId())
        if (player.sameId(this.getCurrentPlayer().getId())) //Neu dang trong luot
            this.processor.onReceiveCard(cardId, player);
    },
    onUsedMove: function (player, move, fromSlot) {
        this.processor.onUsedMove(player, move, fromSlot);
    },
    //Get and Set
    get_BattleArea: function () { return this.battleAreaNode; },
    getBattleArea: function () { return this.battleAreaNode.getComponent("BattleArea"); },
    getTopUI: function () { return this.topUINode; },
    getprocessor: function () { return this.processor; },
    getPlayer: function () { return this.player[1]; },
    getPlayerWithId: function(id){return this.player[id]},
    getCurrentPlayer: function () { return this.currentTurnPlayer; },
    getCurrentTurn: function () { return this.turnCount; },
    getPlayers: function () { return this.player; },
    getHandOfCurrentPlayer: function () { return this.hand[this.currentTurnPlayer.getId()]; },

    //Check
    isPlayerTurn: function () { return this.player[1].sameId(this.currentTurnPlayer.getId()); },
    isStartPhase: function () { return this.currentPhase == CONST.GAME_PHASE.START; },
    isPlayPhase: function () { return this.currentPhase == CONST.GAME_PHASE.PLAY; },
    canUseMove: function (player, move, fromSlot) {
        return this.processor.checkOnUsingMove(player, move, fromSlot);
    },
});