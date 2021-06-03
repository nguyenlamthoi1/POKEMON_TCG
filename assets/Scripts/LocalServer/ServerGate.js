

cc.Class({
    extends: cc.Component,

    properties: {
       serverNode: cc.Node
    },
    onLoad: function(){
        this.server = this.serverNode.getComponent("LocalServer");
    }

});
