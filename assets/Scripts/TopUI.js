

cc.Class({
    extends: cc.Component,

    properties: {
      notifier: cc.Label,
      cancelSelectBtn : cc.Button,
      selectBtn: cc.Button,
      endTurnBtn: cc.Button,
      endEnemyTurnBtn: cc.Button
    },
    init: function(gameManager)
    {
        this.gm = gameManager;

        this.endTurnBtn.node.active = false;
        this.endEnemyTurnBtn.node.active = false;
        this.cancelSelectBtn.node.active = false;
        this.selectBtn.node.active = false;
        this.endTurnBtn.node.on("click", this.onTouchEndTurnBtn, this);
        this.endEnemyTurnBtn.node.on("click",this.onTouchEndTurnBtn, this);
        this.cancelSelectBtn.node.on("click", this.onTouchCancelSelectBtn, this);
        this.gm.node.on(CONST.GAME_PHASE.ON_TURN_START, this.onTurnStart, this);
        this.gm.node.on(CONST.GAME_PHASE.ON_TURN_END, this.onTurnEnd, this);
    },
    notify: function(txt , color, fontSize, seconds, inf){
        if(this._isNotifying && this.sched){
            clearTimeout(this._sched);
        }
        if (color == undefined) color = cc.Color.RED;
        if (fontSize == undefined) fontSize = 40;
        this.notifier.node.active = true;
        this.notifier.node.color = color;
        this.notifier.fontSize = fontSize;
        this.notifier.string = txt;
        this._isNotifying = true;
        if(seconds == undefined) seconds = 3;
        if(!inf) this._sched = setTimeout(function(){cc.log("setTimeOut");this._isNotifying = false; this.notifier.node.active =false;}.bind(this), seconds * 1000);
    },
    onTouchEndTurnBtn: function(){
        cc.log("PLAYER_ID",this.player.getId(), "END_TURN");
        this.gm.endTurn();
    },
    onTouchCancelSelectBtn: function(){
        cc.log("CANCEL");
    },
    onTurnStart: function(event){
        //Check if now is our turn
        this.player =  event.player;
        //cc.log("PLAYER_ID",this.player.getId(), "START_TURN");
        if(this.gm.isPlayerTurn()){
            //Show button
            this.endTurnBtn.node.active = true;
        }else{
            this.endEnemyTurnBtn.node.active = true;  
        }
    },
    onTurnEnd: function(event){
        //cc.log("ON_TURN_END",this.player.isOpponent() , this.player.getId(), this.gm.controllingPlayerId);
        
        if(this.player.isOpponent()){
            this.endEnemyTurnBtn.node.active = false;
        }else{
            this.endTurnBtn.node.active = false;
        }
        //this.endTurnBtn.node.active = false; //TODO: REOPEN IN FUTURE
    }
});
