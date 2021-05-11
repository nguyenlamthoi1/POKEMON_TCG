
cc.Class({
    extends: cc.Component,

    properties: {
        versusLogo: cc.Node,
        redPanel: cc.Node,
        bluePanel: cc.Node,
        colorBg: cc.Node,
        redTrainer: cc.Node,
        blueTrainer: cc.Node
    },
    show: function(delay){
        //this.versusLogoWidget = this.versusLogo.getComponent(cc.Widget);
        cc.log(
            "show_versus"
        )
       this.colorBg.active = true;
        this.node.active =true;
       //versus logo
        var oldPos = this.versusLogo.position;
        this.versusLogo.scale = 0.3;
        cc.tween(this.versusLogo)
        .to(0.5, {scale: 1, position : oldPos})
        // .call(function(){
        //     this.versusLogoWidget.updateAlignment();
        // }.bind(this))
        .start();
        
         //RedPanel
         //var oldPos = this.redPanel.position;
         var oldPos = cc.v2(-cc.winSize.width/2, 0);
        this.redPanel.position = this.redPanel.position.add(cc.v2(-cc.winSize.width));
         cc.tween(this.redPanel)
         .to(0.6, {position : oldPos})
         .call(function(){this.redTrainer.getComponent(cc.Animation).play("idle");}.bind(this))
         .start();
         
         //BliePanel
         //var oldPos = this.bluePanel.position;
         var oldPos = cc.v2(cc.winSize.width/2, 0);
        this.bluePanel.position = this.bluePanel.position.add(cc.v2(cc.winSize.width));
         cc.tween(this.bluePanel)
         .to(0.6, {position : oldPos})
         .call(function(){this.blueTrainer.getComponent(cc.Animation).play("idle");}.bind(this))
         .start();

        setTimeout(this.hide.bind(this), delay*1000);
    },
    hide: function(){
        this.colorBg.active = false;

        this.node.active =true;
       //versus logo
        var oldPos = this.versusLogo.position;
        this.versusLogo.scale = 0.3;
        cc.tween(this.versusLogo)
        .to(0.5, {position : cc.v2(0,cc.winSize.height + 100)})
        .start();
        
         cc.tween(this.redPanel)
         .to(0.6, {position : cc.v2(this.redPanel.position.add(cc.v2(-cc.winSize.width)), 0)})
         .start();
       
         cc.tween(this.bluePanel)
         .to(0.6, {position : cc.v2(this.bluePanel.position.add(cc.v2(cc.winSize.width)), 0)})
         .start();

    }
});
