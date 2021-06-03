var PlayerManager = cc.Class({
    init: function(userData){
        this._userData = userData;
        this._id = userData.id;
        this._card = userData.card;
    },
    getId: function(){return this._id;},
    getOwnCard: function(){return this._card;}
});

window.PlayerMgr = new PlayerManager();