var uiPanel = require("uiPanel");
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
        nano.request("game.Join", {"version":"1.9.3", "deskId": this.editBox.string}, this.joinRoomResponse.bind(this))
    },

    //加入房间回调
    joinRoomResponse: function(data) {
        console.log(data)
        if (data.code == 0){
            console.log("desk id:", data.tableInfo.deskId)

            //打开房间界面
            GLB.roomId = data.tableInfo.deskId;
            uiFunc.openUI("uiRoom", function(obj) {
                var room = obj.getComponent('uiRoom');
                room.joinRoomInit({"roomID":data.tableInfo.deskId, "owner": data.tableInfo.creator});
                
                uiFunc.closeUI(this.node.name);
                this.node.destroy();
            }.bind(this))
        }else{

        }
    },

    onDestroy() {
    }
});
