SvPlayer = cc.Class({
    init: function(id, playerInfo){
        this._id = id;
        this._playerInfo = playerInfo;
    },
    getId: function(){return this._id;}
});
PlayerDataManager = cc.Class({
    ctor: function () {
        this.LOG_TAG = "[SV_PLAYER_MGR]";
        this._player = null;
        this.JSON_FILES = [
            "ServerJSON/PlayerData/user000",
            "ServerJSON/PlayerData/user001"
        ];
    },
    init: function () {
        //this.cardInfo = {};

    },
    load: function () {
        //For loading
        this._player = {};
        this.finishLoaded = false;

        this.loadedStepCount = 0; //Tong so lenh cc.resources.load "da duoc goi"
        this.totalLoadErr = 0;  //Tong so lenh cc.resources.load "THAT BAI"
        this.totalStep = this.JSON_FILES.length; // To so lenh lenh cc.resources.load "can duoc goi"

        for (var i = 0; i < this.JSON_FILES.length; i++) {
            //cc.log(this.LOG_TAG, "[START_LOAD]", this.JSON_FILES[i]);
            cc.resources.load(this.JSON_FILES[i], function (url, err, jsonAsset) {
                if (err) {
                    cc.log(this.LOG_TAG, url, "[READ_ERROR]", err);
                    this.totalLoadErr++;
                }
                else {
                    cc.log(this.LOG_TAG, url, "[READ_SUCCESS]"
                    //    , JSON.stringify(jsonAsset.json)
                    );
                    var player = new SvPlayer(); player.init(jsonAsset.json.id, jsonAsset.json);
                    this._player[jsonAsset.json.id] = player;
                }
                this.loadedStepCount++;
            }.bind(this, this.JSON_FILES[i]));
        }

    },
    
});
