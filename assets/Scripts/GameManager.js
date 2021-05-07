
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
        if (enabled) this._gm.node.emit("droppable-changed-true", {id: this._id, enabled: this._canDropCard});
        else this._gm.node.emit("droppable-changed-false",{id: this._id, enabled: this._canDropCard}); 
    },
    isDropEnabled: function(){return this._canDropCard;},
    registerEvent: function(eventType, cb, target){
        this._gm.node.on(eventType, cb, target);
    }
    //--
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

        controllingPlayerId = this.player1Id; //TODO: delete
        this.player1Cards = fakeCard1; //TODO: delete 
        //Init UI

        this.handUI.getComponent("HandUI").init(this.player1Cards, this.player[1], this);
        this.factory = new CardFactory(); this.factory.init(this);

    },
    start () {
        cc.log("START_GAME");
        
        //Listen to events
        this.node.on(GAME_PHASE.ON_GAME_START, this.onGameStart, this);

        this.changePhase(GAME_PHASE.START_GAME); //TODO: wait server notify START_GAME;
    },
    changePhase: function(phase){
        this.currentPhase = phase;
        switch (phase){
            case GAME_PHASE.START_GAME:
                this.node.emit(CONST.GAME_PHASE.ON_GAME_START, phase);
        }
    },
    isPhase:function(phase){return this.currentPhase == phase;},
    onGameStart: function(){
        //Set first turn
        this.currentTurnId = this.player[1].getId();
        this.nextTurnId = this.player[2].getId();
        //Get first cards
        var handUIScr = this.handUI.getComponent("HandUI");
        handUIScr.draw(GAMESTART_CONST.NUM_DRAW);
        //Notify
        var topUIScr = this.topUINode.getComponent("TopUI");
        topUIScr.notify("DROP YOUR ACTIVE POKEMON", cc.Color.WHITE, 20);
        //Show selectable Area If first turn belong to us(Player not Enemy)
        if(this.player[1].sameId(this.currentTurnId)){
            this.player[1].enableDrop(true); //Player can drop
        }

    },
    onDropCard: function(idx){
        cc.log("test_drop", idx);
        this.factory.onReceiveCard(idx, this.player1Id);
    }
    ,
    //Get and Set
    getBattleArea: function(){return this.battleAreaNode;},
    getTopUI: function(){return this.topUINode;}

});
window.GM = null;