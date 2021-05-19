window.Utils = {
    //Position
    getLocalPosition: function(node, localNode){
        var worldPos = node.parent.convertToWorldSpaceAR(node.position);
        return localNode.convertToNodeSpaceAR(worldPos);
    }
}