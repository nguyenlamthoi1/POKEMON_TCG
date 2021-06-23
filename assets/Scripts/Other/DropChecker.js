
cc.Class({
    extends: cc.Component,

    properties: {

    },
    onLoad: function () {
        this.init();
    },
    init: function () {
        this.collisionSprite = this.node.getComponent(cc.Sprite);
        this.collisionSprite.enabled = false;
        this.collider = this.node.getComponent(cc.BoxCollider);
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
    setCheckPointInColliderEnabled(enabled) { this._checkPointInCollider = enabled; },
    onCollisionEnter: function (other, self) {
        if (other.tag != this._otherTag) return;
        if (!this._checkPointInCollider) {
            cc.log("ENTER_NO_CHECK");
            this.showArea();
        } else {
            this._stayed = false;
        }
    },
    onCollisionStay: function (other, self) {
        if (other.tag != this._otherTag) return;
        if (!this._checkPointInCollider) {
            cc.log("EXIT_NO_CHECK");
        }
        else {
            var otherWorldPosition = Utils.getWordPosition(other.node);
            if (cc.Intersection.pointInPolygon(otherWorldPosition, self.world.points)) {
                if (!this._stayed) {
                    cc.log("ENTER_WITH_CHECK");
                    this.showArea();
                    this._stayed = true;
                }
                else {
                    cc.log("STAY_WITH_CHECK");
                }
            }
            else if (this._stayed) {
                cc.log("EXIT_WITH_CHECK");
                this._stayed = false;
                this.hideArea();
            }
        }
    },
    onCollisionExit: function (other, self) {
        if (other.tag != this._otherTag) return;
        if (!this._checkPointInCollider) {
            cc.log("STAY_NO_CHECK");
            this.hideArea();
        }
    },
    showArea: function(){
        this.collisionSprite.enabled =true;
    },
    hideArea: function(){
        this.collisionSprite.enabled =false;

    }

});
