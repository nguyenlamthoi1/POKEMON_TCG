window.SERVER = {
    CARD_MGR: null,
    PLAYER_MGR: null,
    GATE: null,
};
window.LOCAL_SERVER = null;

cc.Class({
    extends: cc.Component,
    properties: {
        loadingTxt: cc.Label,
        loadingUI: cc.Node,
        //Server Gate
        serverConntectionGate: cc.Node
    },
    onLoad: function(){

        //Keep this node after scene switching
        cc.game.addPersistRootNode(this.node);

        LOCAL_SERVER = this;
        //variables
        this.LOG_TAG = "[SV]";
        //--
        cc.log(this.LOG_TAG, "[ON_LOAD]");

        //Global variables
        //  -   Data Manager
        SERVER.CARD_MGR = new CardDataManager(); SERVER.CARD_MGR.init();
        SERVER.PLAYER_MGR = new PlayerDataManager(); SERVER.PLAYER_MGR.init();
        SERVER.GATE = this.node.getChildByName("ServerGate").getComponent("ServerGate"); SERVER.GATE.init();
        //--
  
        //Load Data
        this.showLoadingUI();
        this.loadData();

        
    },
    loadData: function(){
        this._loadData(
            [
                {obj: SERVER.CARD_MGR, para: []},
                {obj: SERVER.PLAYER_MGR, para: []}

            ],
            function(){
               //End Loading UI
               this.hideLoadingUI();
               //New Scene
               cc.director.loadScene("Login");
            }.bind(this)
        );
    },
    _loadData: function(objs, finishCb){
        cc.log(this.LOG_TAG, "[START_LOAD_DATA]");
        this._errorLoadedStep = 0; 
        this._totalLoadedStep = 0;
        this._totalLoadedObj = 0;
        this._loadingObjects = objs;
        this._finishCb = finishCb;

        for (const loadingObject of this._loadingObjects) 
            loadingObject.obj.load(loadingObject.para); //Thuc hien load function cua moi object

        this._checkLoadCallback = function(){ //Check load callback
            //cc.log("CHECK_LOAD_CB");
            if(this._totalLoadedObj == this._loadingObjects.length) {
                cc.log(this.LOG_TAG, "[FINISH_LOAD_DATA]","[TOTAL]", this._totalLoadedStep, "[ERR_TOTAL]", this._errorLoadedStep);
                this._finishCb != undefined &&  this._finishCb();
                this.unschedule(this._checkLoadCallback);
            }
            for (var loadingObject of this._loadingObjects){
                if(!loadingObject.obj.finishLoaded && loadingObject.obj.loadedStepCount == loadingObject.obj.totalStep){
                    this._errorLoadedStep += loadingObject.obj.totalLoadErr;
                    this._totalLoadedStep +=  loadingObject.obj.totalStep;
                    this._totalLoadedObj += 1;
                    loadingObject.obj.finishLoaded = true;
                }
            }
        }

        const interval = 0.2; //Kiem tra loading moi 0.2s
        this.schedule(this._checkLoadCallback, interval); // Thuc thi check load callback moi <interval> giay
    },
    showLoadingUI: function(){
        this.loadingUI.active = true;
        var loadingBall = this.loadingUI.getChildByName("LoadingBall");
        cc.tween(loadingBall)
        .by(1, {angle: 360})
        .repeatForever()
        .start(); 
    },
    hideLoadingUI: function(){
        this.loadingUI.active = false;
    },
});
