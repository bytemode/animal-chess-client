//回合提示弹窗

var GLB = require("Glb");
var uiPanel = require("uiPanel");

cc.Class({
    extends: uiPanel,
    properties: {
        otherTipTxt: cc.SpriteFrame,
        selfTipTxt: cc.SpriteFrame //自己的回合
    },

    onLoad() {
        this._super();
    },

    setData(whichOne){
        this.node.getComponent(cc.Animation).play().on('finished', this.animationFinished.bind(this));
        
        var nodeSprite = this.node.getChildByName('content').getComponent(cc.Sprite);
        if (whichOne === GLB.ROUND_TIP.SELF) {
            nodeSprite.spriteFrame = this.selfTipTxt;
        } else {
            nodeSprite.spriteFrame = this.otherTipTxt;
        }
    },

    animationFinished () {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    }
});
