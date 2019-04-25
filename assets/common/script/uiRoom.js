var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: uiPanel,
    properties: {},

    onLoad() {
        this._super();
        this.players = [];
        this.roomId = 0;
        this.roomInfo = null;
        this.owner = 0;
        this.playerPrefab = this.nodeDict["player"];
        this.playerPrefab.active = false;
        this.nodeDict["quit"].on("click", this.quit, this);
        this.nodeDict["startGame"].on("click", this.startGame, this);

        clientEvent.on(clientEvent.eventType.leaveRoomNotify, this.leaveRoomNotify, this);

        for (var i = 0; i < GLB.MAX_PLAYER_COUNT; i++) {
            var temp = cc.instantiate(this.playerPrefab);
            temp.active = true;
            temp.parent = this.nodeDict["layout"];
            var roomUserInfo = temp.getComponent('roomUserInfo');
            roomUserInfo.init();
            this.players.push(roomUserInfo);
        }

        //加入房间的通知
        nano.on("onPlayerEnter", this.joinRoomNotify.bind(this))
    },

    leaveRoomNotify: function(data) {
        for (var j = 0; j < this.players.length; j++) {
            if (this.players[j].userId === data.leaveRoomInfo.userId) {
                this.players[j].init();
                break;
            }
        }
        this.ownerId = data.leaveRoomInfo.owner;
        if (this.ownerId === GLB.userInfo.id) {
            GLB.isRoomOwner = true;
        }
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].userId !== 0) {
                this.players[i].setData(this.players[i].userId, this.ownerId);
            }
        }
        this.refreshStartBtn();
    },

    onDestroy() {
    },

    //-------------------------------------------------------------------------------------------
    //创建房间返回初始换房间基本信息
    createRoomInit(rsp) {
        this.roomId = rsp.roomID;
        this.ownerId = rsp.owner;
        this.players[0].setData(this.ownerId, this.ownerId);
        GLB.isRoomOwner = true;
        this.nodeDict["roomID"].string = this.roomId
    },

    //离开房间
    quit: function() {
        nano.request("game.Exit", {"isDestroy": true}, this.exitRoomRsp.bind(this))
    },

    //离开房间返回
    exitRoomRsp: function(data){
        console.log(data)

        if (data.code == 0){
            GLB.isRoomOwner = false;
            uiFunc.closeUI(this.node.name);
            this.node.destroy();
        }
    },

    //ready
    startGame: function() {
        nano.notify("game.Ready", {})
    },

    //加入房间的通知
    joinRoomNotify: function(data) {
        console.log(data)
        for (var j = 0; j < data.data.length; j++) {
            this.players[j].userId = data.data[j].acId
            this.players[j].setData(data.data[j].acId, this.ownerId);
        }
    },
});
