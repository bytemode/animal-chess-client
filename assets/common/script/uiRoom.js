var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: uiPanel,
    properties: {
        txtRoomID: {
            default: null,
            type: cc.Label
        },
    },

    onLoad() {
        this._super();
        this.players = [];
        this.roomId = 0;
        this.owner = 0;
        this.playerPrefab = this.nodeDict["player"];
        this.playerPrefab.active = false;
        this.nodeDict["quit"].on("click", this.quit, this);
        this.nodeDict["startGame"].on("click", this.startGame, this);

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

        clientEvent.on(clientEvent.eventType.onDuanPai, this.onDuanPai, this);
    },

    onDestroy() {
        clientEvent.off(clientEvent.eventType.onDuanPai, this.onDuanPai, this);
    },

    //创建房间返回初始换房间基本信息
    createRoomInit: function(data) {
        this.roomId = data.roomID;
        this.ownerId = data.owner;
        this.players[0].setData(this.ownerId, this.ownerId);
        GLB.isRoomOwner = true;
        this.txtRoomID.string = this.roomId
    },

    joinRoomInit: function(data){
        this.roomId = data.roomID;
        this.ownerId = data.owner;
        this.players[0].setData(this.ownerId, this.ownerId);
        GLB.isRoomOwner = false;
        this.txtRoomID.string = this.roomId
        this.players[1].setData(GLB.userInfo.id, this.ownerId);
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

    onDuanPai: function(data){
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    }
});
