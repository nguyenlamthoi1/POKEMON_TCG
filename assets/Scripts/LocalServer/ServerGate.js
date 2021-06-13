

cc.Class({
    extends: cc.Component,

    properties: {
      
    },
    init: function(){
        this.LOG_TAG = "[SERVER_GATE]"
    },
    
    reicvConnectRequest: function(clientGate, username, password){//ClientGate: cc.Node
        var player = SERVER.PLAYER_MGR.getPlayer(username);
        var error = null;
        if(player == undefined){//User dont exist
            error =  ERROR_TYPE.LOGIN.WRONG_USERNAME;
        }
        else{
            error = player.isRightLogin(username, password);
        }
        if(error == ERROR_TYPE.SUCCESS){
            player.login(clientGate);
            clientGate.node.on(NW_REQUEST.CLIENT_SEND_PACKAGE,this._onRecvPackageFromClient, this); //Listen to Client
        }
        //Create bridge between client and server
        clientGate.node.on()
        //Create Package 
        var pkg = {
            "error": error
        }
        this.node.emit(NW_REQUEST.CONNECT_TO_SERVER, pkg)
    },
    _onRecvPackageFromClient: function(pkg){
        cc.log(this.LOG_TAG, "[RECV_PACKAGE]", JSON.stringify(pkg.cmd), JSON.stringify(pkg.data));
        //Parse to command
        //Package is object {cmd: 1000, data: {}}
        var cmdId = pkg.cmd;
        switch(cmdId){
            case NW_REQUEST.CMD_GET_PLAYER_DATA:
                {
                    var player = SERVER.PLAYER_MGR.getPlayer(pkg.client.username);
                    var client =pkg.client.client;
                    player.setClient(client);
                    var clientPkg = {
                        cmd: cmdId,
                        data: {
                            playerInfo: player.getPlayerInfoClone()
                        }
                    }
                    client.onReceivePackageFromServer(clientPkg);
                }
                break;
                case NW_REQUEST.CMD_SAVE_DECK:
                    {
                        var player = SERVER.PLAYER_MGR.getPlayer(pkg.client.username);
                        //var check = player.checkDeck(pkg.data.deck);
                        //if (check)
                        player.saveDeck(pkg.data.deck);
                        
                        var client =pkg.client.client;
                        var clientPkg = {
                            cmd: cmdId,
                            data: {
                                error: true
                            }
                        }
                        client.onReceivePackageFromServer(clientPkg);
                    }
                    break;
                case NW_REQUEST.CMD_FIND_GAME:
                    {
                        var player = SERVER.PLAYER_MGR.getPlayer(pkg.client.username);
                        SERVER.ROOM_MGR.findPlayRoom(player);
                        
                    }
                    break;
                
            
        }

    },
    

});
