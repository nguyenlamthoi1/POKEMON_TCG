window.Utils = {
    //Position
    getLocalPosition: function (node, localNode) {
        var worldPos = node.parent.convertToWorldSpaceAR(node.position);
        return localNode.convertToNodeSpaceAR(worldPos);
    },
    getWordPosition: function (node) {
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

    },
    doPop: function (node, time, fromScale, toScale) {
        node.active = true;
        node.scale = fromScale ? fromScale : node.scale;
        toScale = toScale ? toScale : 1;
        node.opacity = 0;
        return cc.tween(node)
            .to(time, { scale: toScale, opacity: 255}, { easing: 'quartInOut' })
            .start();
    },
    doUnPop: function (node, time, fromScale, toScale) {
        node.scale = fromScale ? fromScale : node.scale;
        toScale = toScale ? toScale : 0.2;
        node.opacity = 255;
        return cc.tween(node)
            .to(time, { scale: toScale, opacity: toScale }, { easing: 'quartInOut' })
            .call(function(){node.active = false;}.bind(node))
            .start();
    }
}