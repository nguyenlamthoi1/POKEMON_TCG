
window.FAKE_CARDS = [
    1,2,3,4,5,6
];
window.JARVIS = null,
window.RES_MGR = null,
cc.Class({
    extends: cc.Component,

    properties: {
        startGameBtn: cc.Button,
        loadingUI: cc.Node,
    },
    onLoad () {
        this.LOG_TAG = "LOGIN_SCENE";
        this.startGameBtn.node.on("click", this.onTouchStartBtn, this);
        this.loadingBall = this.loadingUI.getChildByName("LoadingBall");
        this.showLoading();
        this.init();
    },
    init: function(){
        //Create Global variables
        JARVIS = new DataManager(); JARVIS.init()//Data Manager
        RES_MGR = new ResourcesManager();  RES_MGR.init()//Resource Manager
        this.loadData(
            [
                {obj: JARVIS, para: []}
            ],
            function(){
                this.hideLoading();
                this.startGameBtn.node.active = true;
            }.bind(this)
        );
    },
    loadData: function(objs, finishCb){
        cc.log(this.LOG_TAG, "[START_LOAD_DATA]");
        const interval = 0.2;
        this._errorLoadedStep = 0;
        this._totalLoadedStep = 0;
        this._totalLoadedObj = 0;
        this._loadingObjects = objs;
        this._finishCb = finishCb;
        for (var loadingObject of this._loadingObjects) loadingObject.obj.load(loadingObject.para);
        this._checkLoadCallback = function(){
            if(this._totalLoadedObj == this._loadingObjects.length) {
                cc.log(this.LOG_TAG, "[FINISH_LOAD_DATA]","[TOTAL]", this._totalLoadedStep, "[ERR_TOTAL]", this._errorLoadedStep);
                this._finishCb != undefined &&  this._finishCb();
                this.unschedule(this._checkLoadCallback);
            }
            for (var loadingObject of this._loadingObjects){
                if(!loadingObject.obj.finishLoaded && loadingObject.obj.LoadedStepCount == loadingObject.obj.totalStep){
                    this._errorLoadedStep += loadingObject.obj.totalLoadErr;
                    this._totalLoadedStep +=  loadingObject.obj.totalStep;
                    this._totalLoadedObj += 1;
                    loadingObject.obj.finishLoaded = true;
                }
            }
        }
        this.schedule(this._checkLoadCallback, interval);
    },

    onTouchStartBtn: function(){
        const interval = 1;
        this._isGameSceneReady = false;
        //Preload scene
        cc.director.preloadScene("Main", function () {
            this._isGameSceneReady = true;
            cc.log(this.LOG_TAG, "[FINISH_LOAD_MAIN_SCENE]");

        }.bind(this));
        //Hide button
        this.startGameBtn.node.active = false; 
        //Show loading UI
       this.showLoading();
       //Load res and scene
       this.loadData(
           [
                {obj: RES_MGR, para: [1,2,3,4,5,6]}
           ],
           //this.startGame.bind(this)
       );
       var checkAllLoaded = function(){
           //cc.log("load_scene_main",RES_MGR.finishLoaded,this._isGameSceneReady);
            if(RES_MGR.finishLoaded && this._isGameSceneReady){
                cc.log(this.LOG_TAG, "[MOVE_MAIN_SCENE]");
                cc.director.loadScene("Main");
            }
       };
       this.schedule(checkAllLoaded, interval);
    //    this.schedule(function(){cc.log("SCHEDULE_2")}, interval);
    },
    showLoading: function(){
        this.loadingUI.active = true;
        //var loadingBall = this.loadingUI.getChildByName("LoadingBall");
        cc.tween(this.loadingBall)
        .by(1, {angle: 360})
        .repeatForever()
        .start(); 
    },
    hideLoading: function(){
        this.loadingUI.active = false;
    }
});
