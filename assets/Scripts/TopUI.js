

cc.Class({
    extends: cc.Component,

    properties: {
      notifier: cc.Label,
      cancelSelectBtn : cc.Button,
      selectBtn: cc.Button,
      endTurnBtn: cc.Button,
      endEnemyTurnBtn: cc.Button,
      bigPokemonCard: cc.Node,
      touchOut: cc.Node
    },
    init: function(gameManager, player)
    {
        this.gm = gameManager;
        this.player = player;

        this.endTurnBtn.node.active = false;
        this.endEnemyTurnBtn.node.active = false;
        this.cancelSelectBtn.node.active = false;
        this.selectBtn.node.active = false;
        this.endTurnBtn.node.on("click", this.onTouchEndTurnBtn, this);
        this.endEnemyTurnBtn.node.on("click",this.onTouchEndTurnBtn, this);
        this.cancelSelectBtn.node.on("click", this.onTouchCancelSelectBtn, this);
        this.gm.node.on(CONST.GAME_PHASE.ON_TURN_START, this.onTurnStart, this);
        this.gm.node.on(CONST.GAME_PHASE.ON_TURN_END, this.onTurnEnd, this);

        this.touchOut.on(cc.Node.EventType.TOUCH_START, this._exitUI, this);
        this.bigPokemonCard.on(cc.Node.EventType.TOUCH_START, this._onTouchBigPokemonCard, this);
        this.bigPokemonCard.on("onusedmove", this._onUsedMove, this);
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
    showPokemonCardInfo: function(cardId){
        //var cardId = 1;
        if(cardId == undefined){
            this.bigPokemonCard.active = false;
            this.touchOut.active = false;
            return;
        }
        this._isShowInfo = true;
        this.scheduleOnce(function(){this.touchOut.active = true;}.bind(this),0.5);
        var cardData = JARVIS.getCardData(cardId);
        if(cardData.category == CONST.CARD.CAT.PKM){
            this.bigPokemonCard.active = true;
            this.bigPokemonCard.getComponent("BigCardTemplate").init(cardId);

        }
    },
    showPokemonCardtoAttack: function(cardId, fromSlot){
        //var cardId = 1;
        if(cardId == undefined){
            this.bigPokemonCard.active = false;
            this.touchOut.active = false;
            this.bigPokemonCard.getComponent("BigCardTemplate").onCancelUsed();
            return;
        }
        this._isCanUseMove = true;
        this._fromSlot = fromSlot;
        this.scheduleOnce(function(){this.touchOut.active = true;}.bind(this),0.5);
        var cardData = JARVIS.getCardData(cardId);
        if(cardData.category == CONST.CARD.CAT.PKM){
            this.bigPokemonCard.active = true;
            this.bigPokemonCard.getComponent("BigCardTemplate").init(cardId);
            var moves = this.bigPokemonCard.getComponent("BigCardTemplate").getMoves();
            for (const move of  moves){
                var moveScr = move.getComponent("MoveInfo");
                //var isMoveActive = this.gm.canUseMove(this.player, {moveIdx: moveScr.moveIdx, moveData: moveScr.moveData}, this._fromSlot);
                var isMoveActive = true;
                cc.log("test_is_moveActive", isMoveActive);
                if(isMoveActive){
                    moveScr.onReadyUsed();

                }
            }
            //this.bigPokemonCard.getComponent("BigCardTemplate").onReadyUsed();
        }

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
    },
    _exitUI: function(){
        cc.log("exit");
        this._isShowInfo = false;
        this._isCanUseMove = false;
        this.bigPokemonCard.active = false;
        this.touchOut.active = false;
        this.bigPokemonCard.getComponent("BigCardTemplate").onCancelUsed();
    },
    _onTouchBigPokemonCard(event){
        event.stopPropagation();
    },
    _onUsedMove: function(event){
        if(this._isShowInfo) return;
        //if(!this.gm.canUseMove(this.player, {moveIdx: event.moveIdx, moveData: event.move}, this._fromSlot)) return;

        if(this._isCanUseMove){
            cc.log("top_ui_process_move",JSON.stringify(event.move));
            this.scheduleOnce(function(){
                this._exitUI();
                this.gm.onUsedMove(this.player, {moveIdx: event.moveIdx, moveData: event.move}, this._fromSlot);
            }.bind(this), 0.1)
        }
        
    }
});
