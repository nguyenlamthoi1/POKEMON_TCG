
cc.Class({
    extends: cc.Component,

    properties: {
       pokeball: cc.Node,
    },
    throwBall: function(destPos, openBallCallback){
        this.pokeball.position = cc.v2(0,0);
        this.pokeball.opacity = 255;
        var destPosition = destPos;
        var animPokeball = this.pokeball.getComponent(cc.Animation);
       
        animPokeball.play("throw");
        
        cc.tween(this.pokeball) 
        .parallel(
            cc.tween().to(1,{x: destPosition.x},{easing: "easeOutBack"}),
            cc.tween().to(1,{y: destPosition.y})
        )
           .call(function(){
            var animPokeball = this.pokeball.getComponent(cc.Animation);
            animPokeball.play("open");
            openBallCallback && openBallCallback();
        }.bind(this)).start();
    }
});
