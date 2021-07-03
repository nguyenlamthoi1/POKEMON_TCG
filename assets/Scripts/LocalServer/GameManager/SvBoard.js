SvBoard = cc.Class({
    init: function (gameMaster) {
        this.LOG_TAG = "[BATTLE_AREA]";
        this.gm = gameMaster;
        this.gamePlayer = {};
        this.gamePlayer[PLAYER_1] = this.gm.getGamePlayer(PLAYER_1);
        this.gamePlayer[PLAYER_2] = this.gm.getGamePlayer(PLAYER_2);


        this._bench = {};
        this._numBench = {};
        this._maxBench = {}; 
        this._activeHolder = {};

        this._maxBench[PLAYER_1] = this._maxBench[PLAYER_2] = BOARD.MAX_BENCH;
        for (const playerId in this.gamePlayer) {
            this._activeHolder[playerId] = new SvHolder();
            this._activeHolder[playerId].init(this.gm, BOARD.ACTIVE_PLACE);

            this._bench[playerId] = [];
            this._numBench[playerId] = 0;
            for (var i = 0; i < this._maxBench[playerId]; i++) {
                var svHolder = new SvHolder();
                svHolder.init(this.gm, BOARD.BENCH);
                this._bench[playerId].push(svHolder);
                
            }
            for (var i = 0; i < this._bench[playerId].length; i++) {
                var holder = this._bench[playerId][i];
                holder.getCurPkmName();
            }
        }
        this.showBoard();

    },
    //Action
    playerAddPokemon(playerId, cardId, dropPlace){
        if(dropPlace == BOARD.ACTIVE_PLACE){
            this._activeHolder[playerId].addPokemonCard(cardId);
        }
        else if(dropPlace == BOARD.BENCH){
            for (const benchHolder of this._bench[playerId]) {
              if (!benchHolder.hasPokemon()) {
                benchHolder.addPokemonCard(cardId);
                this._numBench[playerId] ++;
                break;
              }
            }
        }
    },
    //Check
    playerHasActivePKM(playerId){
        return this._activeHolder[playerId].hasPokemon();
    },
    playerHasFullBench(playerId){
        return this._numBench[playerId] >= this._maxBench[playerId];

    },
    showBoard(){
        cc.log(this.LOG_TAG, "[BOARD_INFO]");
       
        for (const playerId in this.gamePlayer) {
            cc.log(" ", playerId, this.gm.getPlayer(playerId).getId());
            cc.log(" ", playerId, "ACTIVE:" ,this._activeHolder[playerId].hasPokemon(), "BENCH", this._numBench[playerId], this._maxBench[playerId]);
            this.showHolder(this._activeHolder[playerId]);
            
            for (var i = 0; i < this._bench[playerId].length; i++) {
                this.showHolder(this._bench[playerId][i]);  
            }
        }
    },
    showHolder(holder){
        cc.log("[", holder.getCurPkmId(), " : ", holder.getCurPkmName(), "]");
    }
});

SvHolder = cc.Class({
    init: function (gm, holderType) {
        this.gm = gm;
        this._type = holderType;
        this._card = {};
        this._card[CONST.CARD.CAT.PKM] = [];
        this._card[CONST.CARD.CAT.ENERGY] = [];
        this._playTurn = -1;
        this.dmgCounter = 0;
    },
    //Action
    addPokemonCard(cardId){//A pokemon comes in play
        this._card[CONST.CARD.CAT.PKM].push(cardId);
        this._playTurn = this.gm.getCurrentTurn(); 
    },
    //--
    //Check
    hasPokemon: function(){return this._card[CONST.CARD.CAT.PKM].length > 0;},
    //Get
    getCurPkmName: function(){
        var id = this._card[CONST.CARD.CAT.PKM][this._card[CONST.CARD.CAT.PKM].length - 1];
        if(id == undefined) return "_";
        return SERVER.CARD_MGR.getCardName(id);
    },
    getCurPkmId: function(){
        return this._card[CONST.CARD.CAT.PKM][this._card[CONST.CARD.CAT.PKM].length - 1];
    },
    getPlayTurn: function(){return this._playTurn;}
});
