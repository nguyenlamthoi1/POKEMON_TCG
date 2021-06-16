
ResourcesManager = cc.Class({
    init: function () {
        this.LOG_TAG = "[RESOURCES_MANAGER]";
        this._SF = {};
        this._bigPkmSF = {};
        this._smallPkmSF = {};
        this._energySF = {};
    },
    load: function (cardIds) {
        this.finishLoaded = false;
        this.LoadedStepCount = 0;
        this.totalLoadErr = 0;
        this.totalStep = 0;
        for (var cardId of cardIds) {
            var cardData = JARVIS.getCardData(cardId);

            //Load small card pokemon SF
            var resUrl = cardData.card.image.url;
            this._load(resUrl);
            resUrl = cardData.card.background.url;
            this._load(resUrl);
            resUrl = cardData.card.frame.url;
            this._load(resUrl);
        }
    },
    _load: function(resUrl){
        if (resUrl != undefined && !this._SF[resUrl]) {
            this.totalStep += 1;
            cc.resources.load(resUrl, cc.SpriteFrame, function (url, err, loadedSpriteFrame) {
                if (!this._SF[url]) {this.LoadedStepCount += 1;}
                else {this.totalStep -= 1;}
                if (!err) {
                    cc.log(this.LOG_TAG, "[LOAD_SUCCESS]", url);
                    this._SF[url] = loadedSpriteFrame;
                    //this._smallPkmSF = loadedSpriteFrame;

                } else {
                    //this.cardImg.spriteFrame = failedSF;
                    cc.log(this.LOG_TAG, "[LOAD_FAILED]", url);
                    this.totalLoadErr += 1;
                }
            }.bind(this, resUrl));
        }
    },
    getRes: function (url) {
        cc.log("getRes", this._SF[url]);
        return this._SF[url];
    },
    reset: function () {

    }
});

//window.RES_MGR = new ResourcesManager();
//window.RES_MGR.init();