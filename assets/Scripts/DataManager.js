
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
    init:  function(){
        //this.cardInfo = {};
        
    },
    load: function(){
        //For loading
        this.cardInfo = {};
        this.finishLoaded = false;
        this.LoadedStepCount = 0;
        this.totalLoadErr = 0;
        this.totalStep = this.JSON_FILES.length;
        for (var i = 0; i < this.JSON_FILES.length; i++){
            //cc.log(this.LOG_TAG, "[START_LOAD]", this.JSON_FILES[i]);
            cc.resources.load(this.JSON_FILES[i], function(err, jsonAsset){
                if(err){
                    cc.log(this.LOG_TAG, jsonAsset.name, "[READ_ERROR]", err);
                    this.totalLoadErr ++;
                }
                else{
                    if(this.cardInfo === null) this.cardInfo = jsonAsset.json;
                    else{
                        this.cardInfo = Object.assign(this.cardInfo, jsonAsset.json);
                    }
                    //cc.log(this.LOG_TAG, jsonAsset.name, "[READ_SUCCESS]", JSON.stringify(jsonAsset.json));
                }
                this.LoadedStepCount ++;
            }.bind(this));
        }
        //cc.log(this.LOG_TAG, "[FINAL_READ]", JSON.stringify(this.cardInfo));

    },
    //Get
    getCardData: function(cardId){
        //cc.log(this.LOG_TAG, "[GET_CARD_DATA]", JSON.stringify(this.cardInfo));
        return this.cardInfo[cardId];
    },
    getCardName: function(cardId){
        return this.cardInfo[cardId].name;
    },
    //Set
    //Check
    isBasicPokemonCard(cardId){
        return this.cardInfo[cardId].category == CONST.CARD.CAT.PKM && this.cardInfo[cardId].stage == CONST.CARD.STAGE.BASIC; 
    },
    canEvolveFrom(stagePkmCardId, lowerStagePkmCardId){
        return this.cardInfo[stagePkmCardId].evolveFrom == this.cardInfo[lowerStagePkmCardId].pkdId;
    }
});

// window.JARVIS = new DataManager();
// window.JARVIS.init();
// window.JARVIS.load();