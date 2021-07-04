GamePlayer = cc.Class({ // Player in a Game
    init: function (id, gm) {
        this._gm = gm;
        this._id = id;
        this._enabledDropCard = false; //Co kha nang drop card hay khong
        this._enabledAttachEnergy = false; //Co kha nang drop energy card hay khong
        this._enabledUseMove = false; //Co kha nang su dung move hay khong
    },
    //Get
    getId() { return this._id; },
    getEnableData() {
        var data = {
            dropCard: this._enabledDropCard,
            useEnergy: this._enabledAttachEnergy,
            useMove: this._enableUseMove
        }
        return data;
    },
    //Set
    setDropCardEnabled(enabled) { this._enabledDropCard = enabled; },
    setAttachEnergyEnabled(enabled) { this._enabledAttachEnergy = enabled; },
    setUseMoveEnabled(enabled) { this._enabledUseMove = enabled; },
    //Check
    canDropCard() { return this._enabledDropCard; },
    canAttachEnery() { return this._enabledAttachEnergy; },
    canUseMove() { return this._enabledUseMove; }
});
PLAYER_1 = 0;
PLAYER_2 = 1;
GameMaster = cc.Class({
    statics: {
        LOG_TAG: "[SERVER_GM]",
        MAX_PLAYER: 2,
        PHASE: {
            START: "START_PHASE",
            PLAY: "PLAY_PHASE"
        },
        FIRST_DRAW: 7
    },
    init: function (room) {
        this._room = room;
    },
    initGame: function (player1, player2) {
        //Ref
        this.player = {};
        this.player[PLAYER_1] = player1;
        this.player[PLAYER_2] = player2;
        //Init Game Player
        this.gamePlayer = {};
        this.gamePlayer[PLAYER_1] = new GamePlayer(); this.gamePlayer[PLAYER_1].init(PLAYER_1, this);
        this.gamePlayer[PLAYER_2] = new GamePlayer(); this.gamePlayer[PLAYER_2].init(PLAYER_2, this);

        //Init Deck
        this.deck = {};
        this.deck[PLAYER_1] = new SvDeck();
        this.deck[PLAYER_1].init(PLAYER_1, this.gamePlayer[PLAYER_1], this);
        this.deck[PLAYER_2] = new SvDeck();
        this.deck[PLAYER_2].init(PLAYER_2, this.gamePlayer[PLAYER_2], this);
        //Init Hand       
        this.hand = {};
        this.hand[PLAYER_1] = new SvHand();
        this.hand[PLAYER_1].init(PLAYER_1, this.gamePlayer[PLAYER_1], this); //Init hand and deck
        this.hand[PLAYER_2] = new SvHand();
        this.hand[PLAYER_2].init(PLAYER_2, this.gamePlayer[PLAYER_2], this); //Init hand and deck
        //Init Board
        this.board = new SvBoard(this, PLAYER_1, PLAYER_2);
        this.board.init(this);
        //Set phase
        this.setPhase(GameMaster.PHASE.START);
    },
    //TURN and PHASE
    setPhase: function (phase) {
        this._phase = phase;
        if (this.isPhase(GameMaster.PHASE.START)) {
            this.onStartPhase();
        } else if (this.isPhase(GameMaster.PHASE.PLAY)) {
            this.onPlayPhase();
        }
    },
    switchTurn() {
        cc.log("CURRENT_PHASE1", this._phase,this.turnCount);

        this.onBetweenTurn();
        this.turnCount++;
        //Switch turn
        var temp = this.currentTurnPlayer;
        this.currentTurnPlayer = this.nextTurnPlayer;
        this.nextTurnPlayer = temp;
        if (this.isPhase(GameMaster.PHASE.START) && (this.turnCount >= 2)) {
           this.setPhase(GameMaster.PHASE.PLAY);
        } else {
            this.currentTurnPlayer.setDropCardEnabled(true);
            this.currentTurnPlayer.setAttachEnergyEnabled(true);
            this.currentTurnPlayer.setUseMoveEnabled(true);
            this.nextTurnPlayer.setDropCardEnabled(false);
            this.nextTurnPlayer.setAttachEnergyEnabled(false);
            this.nextTurnPlayer.setUseMoveEnabled(false);
            this.sendCMD(this.currentTurnPlayer.getId(), NW_REQUEST.CMD_ROOM_DO_ACTION,
                { actions: [{ type: CONST.ACTION.TYPE.SWITCH_TURN, player: this.nextTurnPlayer.getId() }] });
            this.sendCMD(this.nextTurnPlayer.getId(), NW_REQUEST.CMD_ROOM_DO_ACTION,
                { actions: [{ type: CONST.ACTION.TYPE.SWITCH_TURN, player: this.nextTurnPlayer.getId() }] });
        }
        cc.log("CURRENT_PHASE2", this._phase,this.turnCount);
       
    },
    onBetweenTurn() { },
    onStartPhase: function () {
        this.turnCount = 0;
        this.currentTurnPlayer = this.gamePlayer[PLAYER_1];
        this.nextTurnPlayer = this.gamePlayer[PLAYER_2];

        this.gamePlayer[this.currentTurnPlayer.getId()].setDropCardEnabled(true); //Player can drop
        this.gamePlayer[this.currentTurnPlayer.getId()].setAttachEnergyEnabled(false);
        this.gamePlayer[this.currentTurnPlayer.getId()].setUseMoveEnabled(false);


        this.gamePlayer[this.nextTurnPlayer.getId()].setDropCardEnabled(false);
        this.gamePlayer[this.nextTurnPlayer.getId()].setAttachEnergyEnabled(false);
        this.gamePlayer[this.nextTurnPlayer.getId()].setUseMoveEnabled(false);

        //SEND CMD
        var firstHandList = this.hand[this.currentTurnPlayer.getId()].drawTop(GameMaster.FIRST_DRAW);
        this.sendCMD(this.currentTurnPlayer.getId(), NW_REQUEST.CMD_ROOM_START_PHASE,
            {
                goFirst: true,
                player: {
                    playerId: this.currentTurnPlayer.getId(),
                    oppId: this.nextTurnPlayer.getId()
                },
                actions: [
                    { type: CONST.ACTION.TYPE.DRAW, data: { player: this.currentTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW, list: firstHandList } },
                    { type: CONST.ACTION.TYPE.DRAW, data: { player: this.nextTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW }, list: [] },]

            }
        );
        firstHandList = this.hand[this.nextTurnPlayer.getId()].drawTop(GameMaster.FIRST_DRAW);
        this.sendCMD(this.nextTurnPlayer.getId(), NW_REQUEST.CMD_ROOM_START_PHASE,
            {
                goFirst: false,
                player: {
                    playerId: this.nextTurnPlayer.getId(),
                    oppId: this.currentTurnPlayer.getId()
                },
                actions: [
                    { type: CONST.ACTION.TYPE.DRAW, data: { player: this.currentTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW, list: [] } },
                    { type: CONST.ACTION.TYPE.DRAW, data: { player: this.nextTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW, list: firstHandList } },]
            }
        );
    },
    onPlayPhase: function () {
        //Set up data
        this.turnCount = 0;
        //Set up data for current player
        this.currentTurnPlayer.setDropCardEnabled(true);
        this.currentTurnPlayer.setAttachEnergyEnabled(true);
        this.currentTurnPlayer.setUseMoveEnabled(false);
        this.nextTurnPlayer.setDropCardEnabled(false);
        this.nextTurnPlayer.setAttachEnergyEnabled(false);
        this.nextTurnPlayer.setUseMoveEnabled(false);
        //Send CMD
        this.sendCMD(this.currentTurnPlayer.getId(), NW_REQUEST.CMD_ROOM_PLAY_PHASE, { goFirst: true });
        this.sendCMD(this.nextTurnPlayer.getId(), NW_REQUEST.CMD_ROOM_PLAY_PHASE, { goFirst: false });

    },
    //Process Card Dropping
    onPlayerDropCard: function (playerId, cardId, idxHand, dropPlace) {
        if (!this.gamePlayer[playerId].canDropCard()) return false;
        var cardData = SERVER.CARD_MGR.getCardData(cardId);
        switch (cardData.category) {
            case CONST.CARD.CAT.PKM: {
                cc.log("  ", GameMaster.LOG_TAG, "PROCESS_CARD_POKEMON", SERVER.CARD_MGR.getCardName(cardId));
                this.processPKMCard(playerId, cardId, dropPlace);
                break;
            }
        }
        this.sendCMD(this.nextTurnPlayer.getId(), NW_REQUEST.CMD_ROOM_DO_ACTION,
            {
                actions: [
                    { type: CONST.ACTION.TYPE.PLAY_CARD, data: { player: this.currentTurnPlayer.getId(), cardId: cardId, idxHand: idxHand, dropPlace: dropPlace } }]
            }
        );
    },
    onPlayerEndTurn: function (playerId) {
        if (!this.isPlayerTurn(playerId)) return false;
        this.switchTurn();
    },
    processPKMCard: function (playerId, cardId, dropPlace) {
        //Show Battle Slot avaiable
        cc.log("   ", GameMaster.LOG_TAG, "RESULT_PROCESS_PKM", this.isPhase(GameMaster.PHASE.START), this.board.playerHasActivePKM(playerId), this.board.playerHasFullBench(playerId));
        if (this.isPhase(GameMaster.PHASE.START)) {//IF CURRENT PHASE IS START PHASE
            if (!SERVER.CARD_MGR.isBasicPokemonCard(cardId)) return false;

            if (!this.board.playerHasActivePKM(playerId)) { //USER NOT HAVE POKEMON AT ACTIVE POSITION
                this.board.playerAddPokemon(playerId, cardId, dropPlace);
                return true;
            }
            else { //Should select the first empty slot on Bench
                if (!this.board.playerHasFullBench(playerId)) {
                    this.board.playerAddPokemon(playerId, cardId, dropPlace);
                    return true;
                }
                else
                    return false;
            }
        }
        else {
            return false;
        }
        return false;
    },
    //--
    //Get
    getPlayer: function (id) { return this.player[id]; },
    getGamePlayer: function (id) { return this.gamePlayer[id]; },
    getDeck: function (id) { return this.deck[id]; },
    getCurrentTurn: function () { return this.turnCount; },
    getCurrentPhase: function () { return this.phase; },
    getCurrentMatchInfo: function () {
        return { phase: this._phase, turn: this.turnCount };
    },
    //Check
    isPhase(phase) { return this._phase == phase; },
    isPlayerTurn(playerId) { return this.gamePlayer[playerId].getId() == this.currentTurnPlayer.getId(); },
    //Network
    sendCMD: function (playerId, cmdId, cmdData) {
        var player = this.player[playerId];
        var client = player.getClient();
        cmdData.enabled = JSON.parse(JSON.stringify(this.gamePlayer[playerId].getEnableData()));
        cmdData.match = JSON.parse(JSON.stringify(this.getCurrentMatchInfo()));
        var clientPkg = {
            cmd: NW_REQUEST.CMD_ROOM,
            subCmd: cmdId,
            data: cmdData
        }
        client.onReceivePackageFromServer(clientPkg);
    },
    processCMD: function (cmdId, data) {
        cc.log(" ", GameMaster.LOG_TAG, cmdId, JSON.stringify(data));
        switch (cmdId) {
            case NW_REQUEST.CMD_ROOM_DROP_CARD: {
                this.onPlayerDropCard(data.playerId, data.cardId, data.idxHand, data.dropPlace);
                this.board.showBoard();
                break;
            }
            case NW_REQUEST.CMD_ROOM_END_TURN: {
                this.onPlayerEndTurn(data.playerId);
            }
        }
    },
    //---


});
SvDeck = cc.Class({
    init: function (playerId, player, gm) {
        this.LOG_TAG = "[SV_DECK]";
        this._gm = gm;
        this._player = player; //Deck owner
        this._playerId = playerId;
        this._deck = [];

        //Init random deck list from object
        var deckList = this._gm.getPlayer(this._player.getId()).getDeckClone();
        var cardIdList = Object.keys(deckList);
        cc.log(this.LOG_TAG, cardIdList);
        while (cardIdList.length > 0) {
            var randIdx = Math.floor(Math.random() * cardIdList.length);
            var randId = cardIdList[randIdx];
            this._deck.push(randId);
            deckList[randId] -= 1;
            if (deckList[randId] == 0) {
                cardIdList.splice(randIdx, 1); //Delete card out of stock
            }
        }
        cc.log(this.LOG_TAG, this._playerId, "Shuffle_deck", JSON.stringify(this._deck));
    },
    shuffle: function (deck) {
        var currentIndex = deck.length, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [deck[currentIndex], deck[randomIndex]] = [
                deck[randomIndex], deck[currentIndex]];
        }
        return deck;
    },
    drawTop: function (numDraw) {
        var cards = [];
        for (var i = 0; i < numDraw; i++)
            cards.push(this._deck.pop());
        return cards;
    }
});
SvHand = cc.Class({
    init: function (playerId, player, gm) {
        this.LOG_TAG = "[SV_DECK]";
        this._gm = gm;
        this._player = player; //Deck owner
        this._playerId = playerId;

        this._deck = this._gm.getDeck(this._playerId);
        this._cards = [];
    },
    drawTop: function (numDraw) {
        var cardList = this._deck.drawTop(numDraw);
        this._cards.concat(cardList);
        return cardList;
    }
});