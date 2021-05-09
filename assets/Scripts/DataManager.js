
DataManager = cc.Class({
   
    ctor: function(){
        this.LOG_TAG = "DataManager";
        this.cardInfo = null;
        this.cardInfoUrl = "JSON/pokemonData";
        this.JSON_FILES = [
            "JSON/pokemonData",
            "JSON/energyData"
        ];
    },
    init: function(){
        cc.log(this.LOG_TAG, "[INIT]");
        for (var i = 0; i < this.JSON_FILES.length; i++){
            cc.log(this.LOG_TAG, "[START_LOAD]", this.JSON_FILES[i]);
            cc.resources.load(this.JSON_FILES[i], function(err, jsonAsset){
                if(err){
                    cc.log(this.LOG_TAG, jsonAsset.name, "[READ_ERROR]", err);
                }
                else{
                    if(this.cardInfo === null) this.cardInfo = jsonAsset.json;
                    else{
                        this.cardInfo = Object.assign(this.cardInfo, jsonAsset.json);
                    }
                    cc.log(this.LOG_TAG, jsonAsset.name, "[READ_SUCCESS]");
                }
            }.bind(this));
        }
        cc.log(this.LOG_TAG, "[FINAL_READ]", JSON.stringify(this.cardInfo));

    },
    getCardData: function(cardId){
        //cc.log(this.LOG_TAG, "[GET_CARD_DATA]", JSON.stringify(this.cardInfo));
        return this.cardInfo[cardId];
    }
});

window.JARVIS = new DataManager();
window.JARVIS.init();