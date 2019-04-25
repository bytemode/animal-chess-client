var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: uiPanel,

    properties: {},

    start() {
        this.roomPrefab = this.nodeDict["roomPrefab"];
        this.editBox = this.nodeDict["editBox"].getComponent(cc.EditBox);
        this.roomPrefab.active = false;
        this.nodeDict["search"].on("click", this.search, this);
        this.nodeDict["quit"].on("click", this.quit, this);
    },

    quit: function() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    //搜索加入房间
    search: function() {
        if (this.editBox.string === '') {
            return
        }
        nano.request("game.Join", {"version":"1.9.3", "options":{"mode":1}}, this.createRoomRsp.bind(this))
    },

    joinRoomResponse: function(data) {
        if (data.status !== 200) {
            console.log('进入房间失败,异步回调错误码: ' + data.status);
        } else {
            console.log('进入房间成功');
            console.log('房间号: ' + data.roomInfo.roomID);
            if (!data.roomUserInfoList.some(function(x) {
                return x.userId === GLB.userInfo.id;
            })) {
                data.roomUserInfoList.push({
                    userId: GLB.userInfo.id,
                    userProfile: ""
                });
            }
            // 设置房间最大人数--
            for (var i = 0; i < this.roomAttrs.length; i++) {
                if (data.roomInfo.roomID === this.roomAttrs[i].roomID) {
                    GLB.MAX_PLAYER_COUNT = this.roomAttrs[i].maxPlayer;
                    break;
                }
            }

            if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
                uiFunc.openUI("uiRoomVer", function(obj) {
                    var room = obj.getComponent('uiRoom');
                    room.joinRoomInit(data.roomUserInfoList, data.roomInfo);
                    uiFunc.closeUI(this.node.name);
                    this.node.destroy();
                }.bind(this));
            } else {
                uiFunc.openUI("uiRoom", function(obj) {
                    var room = obj.getComponent('uiRoom');
                    room.joinRoomInit(data.roomUserInfoList, data.roomInfo);
                    uiFunc.closeUI(this.node.name);
                    this.node.destroy();
                }.bind(this));
            }
        }
    },

    onDestroy() {
        if (window.wx) {
            wx.offKeyboardComplete();
            wx.offKeyboardInput();
            wx.hideKeyboard();
        }
    }
});
