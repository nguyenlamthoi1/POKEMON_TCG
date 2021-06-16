

cc.Class({
    extends: cc.Component,

    init(id) {
        this.LOG_TAG = "[CLIENT]";
        this._id = id;
        this._haveUpdatedPlayerData = false;
         //Keep this node after scene switching
         cc.game.addPersistRootNode(this.node);
    },
    //Network
    connectToServer: function (username, password) {
        this._username = username;
        this._password = password;
        SERVER.GATE.node.once(NW_REQUEST.CONNECT_TO_SERVER, this._onConnect, this);
        SERVER.GATE.reicvConnectRequest(this, username, password);
    },
    _onConnect: function (pkg) {
        if (pkg.error != ERROR_TYPE.SUCCESS) {
            this._username = this._password = undefined;
        }
        this.sendPackage(NW_REQUEST.CMD_GET_PLAYER_DATA);
        this.node.emit(CONST.EVENT.ON_CONNECT, pkg.error);
    },
    sendPackage: function (cmd, data) {
        this.node.emit(NW_REQUEST.CLIENT_SEND_PACKAGE, { cmd: cmd, data: data, client: { username: this._username, client: this } });
    },
    sendRoomPackage: function(roomCmd, data){
        this.node.emit(NW_REQUEST.CLIENT_SEND_PACKAGE, { cmd: NW_REQUEST.CMD_ROOM, subCmd: roomCmd, data: data, client: { username: this._username, client: this } });
    },
    onReceivePackageFromServer: function (pkg) {
        cc.log(this.LOG_TAG, this._id, "[RECV_PACKAGE]", JSON.stringify(pkg));
        //Parse to command
        //Package is object {cmd: 1000, data: {}}
        var cmdId = pkg.cmd;
        switch (cmdId) {
            case NW_REQUEST.CMD_GET_PLAYER_DATA:
                {
                    this._playerInfo = pkg.data.playerInfo;
                    this._haveUpdatedPlayerData = true;
                }
                break;
            case NW_REQUEST.CMD_SAVE_DECK: {
                this._playerInfo = pkg.data.playerInfo;
                this._haveUpdatedPlayerData = true;
                this.node.emit()
            }
                break;
            case NW_REQUEST.CMD_FOUND_GAME: {
                this.node.emit(CONST.EVENT.ON_FOUND_GAME);
            }
                break;
            case NW_REQUEST.CMD_ROOM: {
                this._gm.processRoomCMD(pkg);
            }
            break;
        }
    },
    
    //--
    //Data
    isHaveNewestPlayerData: function () { return this._haveUpdatedPlayerData;},
    getPlayerCardS: function () { return this._playerInfo.card; },
    //--
    //Set
    setGameManager: function(gm){this._gm = gm;}
});
