var uiPanel = require("uiPanel");
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

        clientEvent.on(clientEvent.eventType.onDuanPai, this.onDuanPai, this);
        clientEvent.on(clientEvent.eventType.onPlayerEnter, this.joinRoomNotify, this)
    },

    onDestroy() {
        clientEvent.off(clientEvent.eventType.onDuanPai, this.onDuanPai, this);
        clientEvent.off(clientEvent.eventType.onPlayerEnter, this.joinRoomNotify, this)
    },

    //创建房间返回初始换房间基本信息
    createRoomInit: function(data) {
        this.roomId = data.roomID;
        this.ownerId = data.owner;
        this.txtRoomID.string = this.roomId
        this.players[0].setData({uid: Game.GameManager.uid, name: Game.GameManager.nickName, headURL: Game.GameManager.headUrl }); //uid name headurl
        GLB.isRoomOwner = true;
    },

    joinRoomInit: function(data){
        this.roomId = data.roomID;
        this.ownerId = data.owner;

        this.players[0].setData({uid: Game.GameManager.uid, name: Game.GameManager.nickName, headURL: Game.GameManager.headUrl }); //uid name headurl
        GLB.isRoomOwner = false;

        this.players[1].setData({uid: this.ownerId, name: ""});
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
    joinRoomNotify: function() {
        console.log("joinRoomNotify")

        var players = Game.GameManager.logic.getPlayerData()
        for (var j = 0; j < players.length; j++) {
            this.players[j].setData(players[j]);
        }
    },

    onDuanPai: function(data){
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    }
});
