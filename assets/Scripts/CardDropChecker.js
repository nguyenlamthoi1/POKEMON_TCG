

cc.Class({
    extends: cc.Component,

    properties: {
        selectedIndicator: cc.Sprite
    },

    start () {
        this.selectedIndicator.enabled = false;
        // var collisionManager = cc.director.getCollisionManager();
        // collisionManager.enabled = true;
        //collisionManager.enabledDebugDraw = true;
        //collisionManager.enabledDrawBoundingBox = true;
    },
    onSelected: function(){
        this.selectedIndicator.enabled = true;
    },
    onNotSelected: function(){
        this.selectedIndicator.enabled = false;
    }

});
