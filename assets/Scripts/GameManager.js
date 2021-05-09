
const GAME_PHASE = {
    SETUP: -1,
    START_GAME: 0,
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
    init: function(id, gameManager){
        this._gm = gameManager;
        this._id = id;
        this._canDropCard = false;
    },
    getId: function(){return this._id},
    sameId: function(id){return this._id == id;},
    //Drop
    enableDrop: function(enabled){
        this._canDropCard = enabled;
        this._gm.node.emit("droppable-changed", {id: this._id, enabled: this._canDropCard});
    },
    isDropEnabled: function(){return this._canDropCard;},
    registerEvent: function(eventType, cb, target){
        this._gm.node.on(eventType, cb, target);
    },
    //--
    //Check
    isOpponent: function(){
        return !this.sameId(this._gm.controllingPlayerId);
    }
}
);
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        controllingPlayerId: -1,
        player1Id: -1,
        player2Id: -1,
        player1Cards: [],
        player2Cards: [],
        currentPhase: GAME_PHASE.SETUP,
        

        //nodes in Top UI
        handUI: cc.Node,
        battleAreaNode: cc.Node,
        topUINode: cc.Node,
        notifier: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
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
        this.handUI.getComponent("HandUI").init(this.player1Cards, this.player[1], this);
        this.processor = new Processor(); this.processor.init(this);
        this.topUIScr = this.topUINode.getComponent("TopUI"); this.topUIScr.init(this);

        //Listen to events
        this.node.on(CONST.GAME_PHASE.ON_GAME_START, this.onGameStart, this);
        this.node.on(CONST.GAME_PHASE.ON_TURN_START, this.onTurnStart, this);
        this.node.on(CONST.GAME_PHASE.ON_TURN_END, this.onTurnEnd, this);
    },
    start () {
        cc.log("START_GAME");
        this.changePhase(GAME_PHASE.START_GAME); //TODO: wait server notify START_GAME;
    },
    changePhase: function(phase){
        this.currentPhase = phase;
        switch (phase){
            case GAME_PHASE.START_GAME:
                this.node.emit(CONST.GAME_PHASE.ON_GAME_START, phase);
        }
    },
    changeTurn: function(phase){
        //Swap turn id
        var temp = this.currentTurnPlayer;
        this.currentTurnPlayer = this.nextTurnPlayer;
        this.nextTurnPlayer = temp;
        cc.log("test_change_turn",this.player[1].sameId(this.currentTurnPlayer));
        this.player[1].enableDrop(this.player[1].sameId(this.currentTurnPlayer.getId())); //Player can drop or not
        this.node.emit(CONST.GAME_PHASE.ON_TURN_START, {player: this.currentTurnPlayer});
        
    },
    isPhase:function(phase){return this.currentPhase == phase;},
    onGameStart: function(){
        //YOU ALWAYS GO FIRST
        //Set first turn
        this.turnCount = 0;
        this.currentTurnPlayer = this.player[1];
        this.nextTurnPlayer = this.player[2];
        //Get first cards
        var handUIScr = this.handUI.getComponent("HandUI");
        handUIScr.draw(GAMESTART_CONST.NUM_DRAW);
        //Notify
        var topUIScr = this.topUINode.getComponent("TopUI");
        topUIScr.notify("DROP YOUR ACTIVE POKEMON", cc.Color.WHITE, 20);
        //Show selectable Area If first turn belong to us(Player not Enemy)
        if(this.isPlayerTurn()){
            this.player[1].enableDrop(true); //Player can drop
        }
        this.node.emit(CONST.GAME_PHASE.ON_TURN_START, {player: this.player[1]});

    },
    onTurnStart: function(){this.turnCount ++;},
    onTurnEnd:function(){},
    endTurn: function(){
        //Check end turn
        if(this.processor.checkEndTurn() === false) {
            return;
        }
        cc.log("checkEndturn_true");

        //Change turn
        this.node.emit(CONST.GAME_PHASE.ON_TURN_END, {player: this.currentTurnPlayer});
        this.changeTurn();
    },
    onDropCard: function(idx){
        cc.log("test_drop", idx);
        this.processor.onReceiveCard(idx, this.player1Id);
    },
    //Get and Set
    getBattleArea: function(){return this.battleAreaNode;},
    getTopUI: function(){return this.topUINode;},
    getprocessor: function(){return this.processor;},
    getPlayer: function(){return this.player[1];},
    //Check
    isPlayerTurn: function(){return this.player[1].sameId(this.currentTurnPlayer.getId()); }

});
window.GM = null;