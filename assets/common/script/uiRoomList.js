/*
 *  brief : 加入房间
 *  author:  
*/

var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");

cc.Class({
    extends: uiPanel,

    properties: {},

    start() {
        this.editBox = this.nodeDict["editBox"].getComponent(cc.EditBox);
        this.nodeDict["search"].on("click", this.search, this);
        this.nodeDict["quit"].on("click", this.quit, this);
        clientEvent.on(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
    },

    quit: function() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    search: function() {
        if (this.editBox.string != '') {
            mvs.engine.joinRoom(this.editBox.string, "joinRoomSpecial");
        }
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

            GLB.MAX_PLAYER_COUNT = 2

            uiFunc.openUI("uiRoomVer", function(obj) {
                var room = obj.getComponent('uiRoom');
                room.joinRoomInit(data.roomUserInfoList, data.roomInfo);
                uiFunc.closeUI(this.node.name);
                this.node.destroy();
            }.bind(this));

        }
    },

    onDestroy() {
        if (window.wx) {
            wx.offKeyboardComplete();
            wx.offKeyboardInput();
            wx.hideKeyboard();
        }
        clientEvent.off(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
    }
});
