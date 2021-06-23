window.Utils = {
    //Position
    getLocalPosition: function (node, localNode) {
        var worldPos = node.parent.convertToWorldSpaceAR(node.position);
        return localNode.convertToNodeSpaceAR(worldPos);
    },
    getWordPosition: function(node){
        return node.parent.convertToWorldSpaceAR(node.position);
    },
    //Action
    doUndulating: function (node, time, fromScale, toScale) {
        node.scale = fromScale;
        return cc.tween(node)
            .repeatForever(
                cc.tween()
                    .to(time, { scale: fromScale })
                    .to(time, { scale: toScale })
            )
            .start();

    }
}