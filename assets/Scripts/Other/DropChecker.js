
cc.Class({
    extends: cc.Component,

    properties: {

    },
    onLoad(){
        this.init();
    },
    init: function () {
        this.collisionSprite = this.node.getComponent(cc.Sprite);
        this.collisionSprite.enabled = false;
        this.collider = this.node.getComponent(cc.BoxCollider);

        this.collider.enabled = false;
        cc.log("TEST_LOAD", this.i);
    },
    setTag(tag){
        this._tag = tag;
    },
    setOtherTag(tag) {
        this._otherTag = tag;
    },
    setSelfTag(tag) {
        this.collider.tag = tag;
    },
    setEnterCb(cb) {
        this._enterCb = cb;
    },
    setExitCb(cb) {
        this._exitCb = cb;
    },
    setStayCb(cb) {
        this._stayCb = cb;
    },
    setCollisionCb(enterCb, exitCb, stayCb) {
        this._enterCb = enterCb;
        this._exitCb = exitCb;
        this._stayCb = stayCb;
    },
    resetCb: function(){
        this._enterCb = this._exitCb  =  this._stayCb = undefined;
    },
    setCheckPointInColliderEnabled(enabled) { this._checkPointInCollider = enabled; },
    onCollisionEnter: function (other, self) {
        if (other.tag != this._otherTag) return;
        if (!this._checkPointInCollider) {
            cc.log("ENTER_NO_CHECK");
            this._enterCb && this._enterCb(other.node);
            this.showArea();
        } else {
            this._stayed = false;
        }
    },
    onCollisionStay: function (other, self) {
        //cc.log("STAY_", this._c);
        if (other.tag != this._otherTag) return;
        if (!this._checkPointInCollider) {
            cc.log("EXIT_NO_CHECK", this._checkPointInCollider, this.i);
            this._exitCb && this._exitCb(other.node);
        }
        else {

            var otherWorldPosition = Utils.getWordPosition(other.node);
            if (cc.Intersection.pointInPolygon(otherWorldPosition, self.world.points)) {
                if (!this._stayed) {
                    cc.log("ENTER_WITH_CHECK");
                    this._enterCb && this._enterCb(other.node);
                    this.showArea();
                    this._stayed = true;
                }
                else {
                    //cc.log("STAY_WITH_CHECK");
                    this._stayCb && this._stayCb(other.node);
                }
            }
            else if (this._stayed) {
                cc.log("EXIT_WITH_CHECK");
                this._exitCb && this._exitCb(other.node);
                this._stayed = false;
                this.hideArea();
            }
        }
    },
    onCollisionExit: function (other, self) {
        if (other.tag != this._otherTag) return;
        if (!this._checkPointInCollider) {
            //cc.log("STAY_NO_CHECK");
            this._stayCb && this._stayCb(other.node);
            this.hideArea();
        }
    },
    showArea: function(){
        this.collisionSprite.enabled =true;
    },
    hideArea: function(){
        this.collisionSprite.enabled =false;

    },
    enabledCheckCollision: function(enabled){
        //this.collisionSprite.enabled = enabled;
        this.collider.enabled = enabled;
    }
});
