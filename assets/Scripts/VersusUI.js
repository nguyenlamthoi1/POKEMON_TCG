
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
    show: function(delay, cb){
        
        this.colorBg.active = true;
        this.node.active =true;
         //versus logo
        var oldPos = this.versusLogo.position;
        this.versusLogo.scale = 0.3;
        cc.tween(this.versusLogo)
        .to(0.5, {scale: 1, position : oldPos})
        .start();
        
         //RedPanel
         var oldPos = cc.v2(-cc.winSize.width/4, 0);//TODO
        this.redPanel.position = this.redPanel.position.add(cc.v2(-cc.winSize.width/2)); //TODO
         cc.tween(this.redPanel)
         .to(0.6, {position : oldPos})
         .call(function(){this.redTrainer.getComponent(cc.Animation).play("idle");}.bind(this))
         .start();
         
         //BluePanel
         var oldPos = cc.v2(cc.winSize.width/4, 0);//TODO
        this.bluePanel.position = this.bluePanel.position.add(cc.v2(cc.winSize.width/2));//TODO
         cc.tween(this.bluePanel)
         .to(0.6, {position : oldPos})
         .call(function(){this.blueTrainer.getComponent(cc.Animation).play("idle");}.bind(this))
         .start();

        //setTimeout(
            this.hide.bind(this)
            // function(cb){
            // this.hide.bind(this);
            // cb();
        //}.bind(this, cb)
        //, delay*1000);
        setTimeout(cb, delay*1000);
    },
    hide: function(){
        this.colorBg.active = false;

        this.node.active =true;

        cc.tween(this.versusLogo)
        .to(0.5, {position : cc.v2(0,cc.winSize.height + 100)})
        .call(function(){this.versusLogo.active = false}.bind(this))
        .start();
        
         cc.tween(this.redPanel)
         .to(0.6, {position : cc.v2(this.redPanel.position.add(cc.v2(-cc.winSize.width/2)), 0)}) //TODO
         .call(function(){this.redPanel.active = false}.bind(this))
         .start();
       
         cc.tween(this.bluePanel)
         .to(0.6, {position : cc.v2(this.bluePanel.position.add(cc.v2(cc.winSize.width/2)), 0)}) //TODO
         .call(function(){this.bluePanel.active = false}.bind(this))
         .start();

        //  this.versusLogo.getComponent(cc.Widget).enabled = false;
        //  this.redPanel.getComponent(cc.Widget).enabled = false;
        //  this.bluePanel.getComponent(cc.Widget).enabled = false;
      

    }
});
