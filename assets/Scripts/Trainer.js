
cc.Class({
    extends: cc.Component,

    properties: {
       pokeball: cc.Node,
       a: 123
    },
    throwBall: function(destPos, openBallCallback){
        cc.log("throwBall");
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
