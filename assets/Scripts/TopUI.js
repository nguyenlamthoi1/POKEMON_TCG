

cc.Class({
    extends: cc.Component,

    properties: {
      notifier: cc.Label
    },
    notify: function(txt , color, fontSize){
        if(this._isNotifying && this.sched){
            clearTimeout(this._sched);
        }
        if (color == undefined) color = cc.Color.RED;
        if (fontSize == undefined) fontSize = 40;
        this.notifier.node.color = color;
        this.notifier.fontSize = fontSize;
        this.notifier.string = txt;
        this.notifier.active = true;
        this._isNotifying = true;
        this._sched = setTimeout(function(){this._isNotifying = false; this.notifier.node.active =false;}.bind(this), 1500);
    }

});
