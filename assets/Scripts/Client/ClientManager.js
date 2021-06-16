
window.CLIENT_MGR = null;
cc.Class({
    extends: cc.Component,

    properties: {
        clients: [cc.Node],
        clientIds: [String],
    },
    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
        
        this._clients = {};
        for (var i = 0; i < this.clients.length; i++) {
            var client = this.clients[i];
            var clientId = this.clientIds[i];
            this._clients[clientId] = client.getComponent("Client");
            this._clients[clientId].init(clientId);
        }
        CLIENT_MGR = this;
    },
    getClient: function (id) {
        return this._clients[id];
    }
});
