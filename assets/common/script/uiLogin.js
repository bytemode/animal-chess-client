var uiPanel = require("uiPanel");
cc.Class({
    extends: uiPanel,
    properties: {
        uidEditbox: {
            type: cc.EditBox,
            default: null,
        },
    },

    onLoad() {
        this._super();
    },

    start() {
        if (window.wx) {
            this.nodeDict["start"].active = false;
            wx.getSystemInfo({
                success: function(data) {
                }
            });
        } else {
            this.nodeDict["start"].on("click", function(){
                console.log(this.uidEditbox)
                Game.GameManager.nanoInit(this.uidEditbox.string)
            }.bind(this), Game.GameManager);
        }
    },

    onEnable() {
    },

    onDisable() {
    }
});
