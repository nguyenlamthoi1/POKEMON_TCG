
var SvRoom = cc.Class({
   
    init: function(roomId){
        this.CONST = {
            MAX_PLAYER: 2
        },
        this._roomId = roomId;
        this._numPlayer = 0;
        this._player = {}
    },
    addPlayer: function(player){ //Them mot player tham gia room
        this._player[this._numPlayer] = player;
        this._numPlayer ++;

    },
    isFull: function(){ //Room da du so luong player
        return this._numPlayer == this.CONST.MAX_PLAYER;
    }
})