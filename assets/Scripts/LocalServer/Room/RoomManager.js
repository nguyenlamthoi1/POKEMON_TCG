GamePlayer = cc.Class({

});
Room = cc.Class({
    statics: {
        LOG_TAG: "[SERVER_ROOM]",
        MAX_PLAYER: 2,
        PLAYER_1: 0, //Id cua nguoi choi 1
        PLAYER_2: 1, //Id cua nguoi choi 2
    },
    init: function (roomId, maxPlayer) {
        this._roomId = roomId; //Room Id
        this.numPlayer = 0; //So luong nguoi choi hien co
        this.maxPlayer = maxPlayer; //So luong nguoi choi toi da
        this.player = {};
        this.gm = new GameMaster; this.gm.init(); //Game Manager - quan ly Logic
    },
    //On
    onFull: function () {
        for (const playerId in this.player) {
            var player = this.player[playerId];
            var clientPkg = {
                cmd: NW_REQUEST.CMD_FOUND_GAME,
                data: {
                    error: true
                }
            }
            player.getClient().onReceivePackageFromServer(clientPkg);
            cc.log(Room.LOG_TAG, this._roomId, 'FOUND_GAME', player.getId());
        }
    },
    //Method
    addPlayer: function (player) {
        player.setRoom(this);
        this.player[this.numPlayer] = player;
        this.numPlayer += 1;
        if(this.isFull()){this.onFull();}
    },
    //Get
    getId: function () { return this._roomId; },
    //Set
    //Check
    isAvailable: function () { return this.numPlayer < this.maxPlayer; },
    isFull: function(){return this.numPlayer >= this.maxPlayer; },
    //Network
    sendCMD: function () {
        //Response
        var client = pkg.client.client;
        var clientPkg = {
            cmd: cmdId,
            data: {
                error: true
            }
        }
        client.onReceivePackageFromServer(clientPkg);
    }
});
RoomManager = cc.Class({
    init: function () {
        this.PREFIX_ID = "ROOM_";
        this.rooms = [];
    },
    findPlayRoom: function (player) {
        cc.log("test_room_len", this.rooms.length);
        var availableRoom = this.rooms.find(function(room) {return room.isAvailable();});
        if (availableRoom) { //Tim duoc phong trong
            availableRoom.addPlayer(player);
        } else {
            this.createNewRoom(player);
        }
    },
    createNewRoom: function (player) {
        var roomId = this.PREFIX_ID + this.rooms.length;
        var room = new Room(); room.init(roomId, Room.MAX_PLAYER);
        room.addPlayer(player);
        this.rooms.push(room); //Tao room voi roomId
        return room;
    }
});