CardDataManager = cc.Class({
    ctor: function () {
        this.LOG_TAG = "[SV_CARD_MGR]";
        this.cardInfo = null;
        this.JSON_FILES = [
            "JSON/pokemonData",
            "JSON/energyData"
        ];
    },
    init: function () {
        //this.cardInfo = {};

    },
    load: function () {
        //For loading
        this.cardInfo = null;
        this.finishLoaded = false;

        this.loadedStepCount = 0; //Tong so lenh cc.resources.load "da duoc goi"
        this.totalLoadErr = 0;  //Tong so lenh cc.resources.load "THAT BAI"
        this.totalStep = this.JSON_FILES.length; // To so lenh lenh cc.resources.load "can duoc goi"

        for (var i = 0; i < this.JSON_FILES.length; i++) {
            //cc.log(this.LOG_TAG, "[START_LOAD]", this.JSON_FILES[i]);
            cc.resources.load(this.JSON_FILES[i], function (err, jsonAsset) {
                if (err) {
                    cc.log(this.LOG_TAG, jsonAsset.name, "[READ_ERROR]", err);
                    this.totalLoadErr++;
                }
                else {
                    cc.log(this.LOG_TAG, jsonAsset.name, "[READ_SUCCESS]"
                        //, JSON.stringify(jsonAsset.json)
                    );

                    if (this.cardInfo === null) {
                        this.cardInfo = jsonAsset.json;
                    }
                    else {
                        this.cardInfo = Object.assign(this.cardInfo, jsonAsset.json);
                    }
                }
                this.loadedStepCount++;
            }.bind(this));
        }

    },
    //Get
    getCardData: function (cardId) {
        //cc.log(this.LOG_TAG, "[GET_CARD_DATA]", JSON.stringify(this.cardInfo));
        return this.cardInfo[cardId];
    },
    getCardName: function (cardId) {
        return this.cardInfo[cardId].name;
    },
    //Set
    //Check
    isBasicPokemonCard: function (cardId) {
        return this.cardInfo[cardId].category == CONST.CARD.CAT.PKM && this.cardInfo[cardId].stage == CONST.CARD.STAGE.BASIC;
    }
});
