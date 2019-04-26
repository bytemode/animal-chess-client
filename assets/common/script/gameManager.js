var GLB = require("Glb");
require("nano")

cc.Class({
    extends: cc.Component,
    blockInput() {
        Game.GameManager.getComponent(cc.BlockInputEvents).enabled = true;
        setTimeout(function() {
            Game.GameManager.node.getComponent(cc.BlockInputEvents).enabled = false;
        }, 1000);
    },
    onLoad() {
        Game.GameManager = this;
        cc.game.addPersistRootNode(this.node);
        dataFunc.loadConfigs();
        cc.view.enableAutoFullScreen(false);
        clientEvent.init();
    },

    logoutResponse: function(status) {
        cc.game.removePersistRootNode(this.node);
        cc.director.loadScene('lobby');
    },

    errorResponse: function(error, msg) {
        if (error === 1001 || error === 0) {
            uiFunc.openUI("uiTip", function(obj) {
                var uiTip = obj.getComponent("uiTip");
                if (uiTip) {
                    uiTip.setData("网络断开连接");
                }
            });
            setTimeout(function() {
                cc.game.removePersistRootNode(this.node);
                cc.director.loadScene('lobby');
            }.bind(this), 2500);
        }
        console.log("错误信息：" + error);
        console.log("错误信息：" + msg);
    },

    onDestroy() {
    },

    //nano init and login
    nanoInit: function(uid){
        nano.init({
            host: "127.0.0.1",
            port: 3325,
            path: '/nano',
            handshakeCallback : function(){}
        }, function() {
            console.log('success');

            nano.request("gate.Login", {"name":"test" + uid, "uid": Number(uid), "headUrl": "test", "sex":1}, function(data){
                console.log(data)
                GLB.userInfo = data
                GLB.userInfo.id = data.acId
                Game.GameManager.nickName = data.nickname
                this.lobbyShow()
            }.bind(this))
        }.bind(this));

        //发牌消息
        nano.on("onDuanPai", this.startGame.bind(this))
    },

    //显示大厅界面
    lobbyShow: function() {
        this.gameState = GameState.None;
        uiFunc.openUI("uiLobbyPanel");
    },

    //开始游戏发牌
    startGame: function(data) {
        clientEvent.dispatch(clientEvent.eventType.onDuanPai, data);
        console.log('-----startGame-----')
        cc.director.loadScene('game', function() {
            uiFunc.openUI("uiGamePanel", function(panel) {
                panel.getComponent("uiGamePanel").timeLabelInit();
                this.sendReadyMsg();
            }.bind(this));
        }.bind(this));
    },
});
