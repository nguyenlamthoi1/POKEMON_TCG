
window.FAKE_CARDS = [
    1, 2, 3, 4, 5, 6
];
window.JARVIS = null;
window.RES_MGR = null;
cc.Class({
    extends: cc.Component,

    properties: {
        //Network
        clientId: "client_1",

        startGameBtn: cc.Button,
        deckBtn: cc.Button,
        loginBtn: cc.Button,

        loginUI: cc.Node,
        loadingUI: cc.Node,
        deckUI: cc.Node,
        overallUI: cc.Node,

        usernameEb: cc.EditBox,
        passwordEb: cc.EditBox,

        notiText: cc.Label
    },
    onLoad() {
        this._client = CLIENT_MGR.getClient(this.clientId);
        this.LOG_TAG = "LOGIN_SCENE";
        this.loadingBall = this.loadingUI.getChildByName("LoadingBall");
        //Create Global variables
        JARVIS = new DataManager(); JARVIS.init()//Data Manager
        RES_MGR = new ResourcesManager(); RES_MGR.init()//Resource Manager

        //this.init();

        //Turn off UI
        this.overallUI.active = false;
        this.deckUI.active = false;
        this.loadingUI.active = false;
        //Turn on UI
        this.loginUI.active = true;
        //Listeners
        this.startGameBtn.node.on("click", this.onTouchStartBtn, this);
        this.deckBtn.node.on("click", this.onTouchDeckBtn, this);
        this.loginBtn.node.on("click", this.startLogin, this);
        
        //Get component
        this.deck = this.deckUI.getComponent("DeckUI"); this.deck.init();

    },
 

    onTouchStartBtn: function () {
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
                {
                    obj: RES_MGR, para: [1, 2, 3, 4, 5, 6, 7, 8, 9, "energy_2", "energy_3"
                        , "energy_0", "energy_4", "energy_1"]
                }
            ],
            //this.startGame.bind(this)
        );
        var checkAllLoaded = function () {
            //cc.log("load_scene_main",RES_MGR.finishLoaded,this._isGameSceneReady);
            if (RES_MGR.finishLoaded && this._isGameSceneReady) {
                cc.log(this.LOG_TAG, "[MOVE_MAIN_SCENE]");
                cc.director.loadScene("Main");
            }
        };
        this.schedule(checkAllLoaded, interval);
        //    this.schedule(function(){cc.log("SCHEDULE_2")}, interval);
    },
    onTouchDeckBtn: function () {
        cc.log(this.LOG_TAG, "select_deck");
        this.deckUI.active = true;
        this.deck.showUI(this._client.getPlayerCardS());
    },
    showLoading: function () {
        this.loadingUI.active = true;
        //var loadingBall = this.loadingUI.getChildByName("LoadingBall");
        cc.tween(this.loadingBall)
            .by(1, { angle: 360 })
            .repeatForever()
            .start();
    },
    hideLoading: function () {
        this.loadingUI.active = false;
    },
    notify: function(text, delay, turnOff){
        this.notiText.node.active = true;
        this.notiText.string = text;
        if(turnOff)
            this.scheduleOnce(function(){this.notiText.node.active = false;}.bind(this), delay);
    },
    
    //----LOGIN---
    startLogin: function(){
        this._client.node.once(CONST.EVENT.ON_CONNECT, this._onLogin, this);
        this._client.connectToServer(this.usernameEb.string, this.passwordEb.string);
        this.notiText.node.active = true;
    },
    _onLogin: function(error){
        if(error == ERROR_TYPE.SUCCESS){
            cc.log(this.LOG_TAG, "Client: ", this.clientId, " connected to server with ", this.usernameEb.string);
            this.loadResources();
            //Turn off login UI
            this.loginUI.active = false;
            this.overallUI.active = true;
            this.notify("", 0, true);
        }else{
            cc.log(this.LOG_TAG, "Client: ", this.clientId, " failed to connect to server with ", this.usernameEb.string);
            switch(error){
                case ERROR_TYPE.LOGIN.WRONG_USERNAME:
                    this.notiText.node.active = true;
                    this.notify("Wrong username. Try again", 0, false);
                    break;
                case ERROR_TYPE.LOGIN.WRONG_PASSWORD:
                    this.notify("Wrong password. Try again", 0, false);
                    break;
            }
        }
    },
    //------------

    //---Load Data--
    loadResources: function () {
        this.showLoading();
        this.loadData(
            [
                { obj: JARVIS, para: [] }
            ],
            function () {
                this.hideLoading();
                this.startGameBtn.node.active = true;
            }.bind(this)
        );
    },
    loadData: function (objs, finishCb) {
        cc.log(this.LOG_TAG, "[START_LOAD_DATA]");
        const interval = 0.2;
        this._errorLoadedStep = 0;
        this._totalLoadedStep = 0;
        this._totalLoadedObj = 0;
        this._loadingObjects = objs;
        this._finishCb = finishCb;
        for (var loadingObject of this._loadingObjects) loadingObject.obj.load(loadingObject.para);
        this._checkLoadCallback = function () {
            if (this._totalLoadedObj == this._loadingObjects.length) {
                cc.log(this.LOG_TAG, "[FINISH_LOAD_DATA]", "[TOTAL]", this._totalLoadedStep, "[ERR_TOTAL]", this._errorLoadedStep);
                this._finishCb != undefined && this._finishCb();
                this.unschedule(this._checkLoadCallback);
            }
            for (var loadingObject of this._loadingObjects) {
                if (!loadingObject.obj.finishLoaded && loadingObject.obj.LoadedStepCount == loadingObject.obj.totalStep) {
                    this._errorLoadedStep += loadingObject.obj.totalLoadErr;
                    this._totalLoadedStep += loadingObject.obj.totalStep;
                    this._totalLoadedObj += 1;
                    loadingObject.obj.finishLoaded = true;
                }
            }
        }
        this.schedule(this._checkLoadCallback, interval);
    },
    //--------------
});
