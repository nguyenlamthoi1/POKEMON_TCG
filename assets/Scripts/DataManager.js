DataManager = cc.Class({
   
    ctor: function(){
        this.LOG_TAG = "DataManager";
        this.cardInfo = null;
        this.cardInfoUrl = "JSON/pokemonData";
    },
    init: function(){
        cc.log(this.LOG_TAG, "[INIT]");
        cc.resources.load(this.cardInfoUrl, function(err, jsonAsset){
            if(err){
                cc.log(this.LOG_TAG, "[ERROR]", err);
            }
            else{
                this.cardInfo = jsonAsset.json;
                cc.log(this.LOG_TAG, "[READ_SUCCESSFULLY]");
                //cc.log(this.LOG_TAG, "[READ_SUCCESSFULLY]", JSON.stringify(this.cardInfo));
            }
        }.bind(this))
    },
    getCardData: function(cardId){
        cc.log(this.LOG_TAG, "[GET_CARD_DATA]", JSON.stringify(this.cardInfo));
        return this.cardInfo[cardId];
    }
});

window.JARVIS = new DataManager();
window.JARVIS.init();