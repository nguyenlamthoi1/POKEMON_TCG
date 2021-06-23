GamePlayer = cc.Class({ // Player in a Game
    init: function (id, gm) {
        this._gm = gm;
        this._id = id;
        this._enabledDropCard = false; //Co kha nang drop card hay khong
        this._enabledUseEnergy = false; //Co kha nang drop energy card hay khong
        this._enabledUseMove = false; //Co kha nang su dung move hay khong
    },
    //Get
    getId: function () { return this._id; },
    //Set
    setDropCardEnabled: function (enabled) { this._enabledDropCard = enabled; },
    setUseEnergyEnabled: function (enabled) { this._enabledUseEnergy = enabled; },
    setUseMoveEnabled: function (enabled) { this._enabledUseMove = enabled; },
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

        //Set phase
        this.setPhase(GameMaster.PHASE.START);
    },
    //TURN and PHASE
    setPhase: function (phase) {
        this._phase = phase
        if (this._phase == GameMaster.PHASE.START) {
            this.onStartPhase();
        }
    },
    setNewTurn: function () {

    },
    onStartPhase: function () {
        this.turnCount = 0;
        this.currentTurnPlayer = this.gamePlayer[PLAYER_2];
        this.nextTurnPlayer = this.gamePlayer[PLAYER_1];

        this.gamePlayer[this.currentTurnPlayer.getId()].setDropCardEnabled(true); //Player can drop
        this.gamePlayer[this.currentTurnPlayer.getId()].setUseEnergyEnabled(false);
        this.gamePlayer[this.currentTurnPlayer.getId()].setUseMoveEnabled(false);


        this.gamePlayer[this.nextTurnPlayer.getId()].setDropCardEnabled(false);
        this.gamePlayer[this.nextTurnPlayer.getId()].setUseEnergyEnabled(false);
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
                    { type: CONST.ACTION.TYPE.DRAW, data: { player: this.nextTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW }, list:[] },]

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
                    { type: CONST.ACTION.TYPE.DRAW, data: { player: this.currentTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW, list:[] } },
                    { type: CONST.ACTION.TYPE.DRAW, data: { player: this.nextTurnPlayer.getId(), numDraw: GameMaster.FIRST_DRAW, list: firstHandList } },]
            }
        );
    },
    //--
    //Get
    getPlayer: function (id) { return this.player[id]; },
    getGamePlayer: function (id) { return this.gamePlayer[id]; },
    getDeck: function (id) { return this.deck[id]; },
    //Network
    sendCMD: function (playerId, cmdId, cmdData) {
        var player = this.player[playerId];
        var client = player.getClient();
        var clientPkg = {
            cmd: NW_REQUEST.CMD_ROOM,
            subCmd: cmdId,
            data: cmdData
        }
        client.onReceivePackageFromServer(clientPkg);
    }

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