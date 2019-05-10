var GLB = require("Glb");
var Logic = require("Logic")

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

        this.logic = Logic
        this.logic.init()
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
                Game.GameManager.uid = data.acId
                Game.GameManager.nickName = data.nickname
                this.lobbyShow()
            }.bind(this))
        }.bind(this));

        //发牌消息
        nano.on("onDuanPai", this.onDuanPai.bind(this))

        //提示玩家出牌
        nano.on("onHintPlayer", this.onHintPlayer.bind(this))

        //翻牌
        nano.on("onOpenPiece", this.onOpenPiece.bind(this))

        //牌局结束
        nano.on("onGameEnd", this.onGameEnd.bind(this))
    },

    //显示大厅界面
    lobbyShow: function() {
        this.gameState = GameState.None;
        uiFunc.openUI("uiLobbyPanel");
    },

    //开始游戏发牌
    onDuanPai: function(data) {
        console.log("onDuanPai", data)
        this.logic.initFaPai(data)

        //加载游戏场景
        cc.director.loadScene('game', function() {
            uiFunc.openUI("uiGamePanel", function(panel) {
                //初始化游戏包括敌我双向 棋盘信息
                panel.getComponent("uiGamePanel").gameStart();
            }.bind(this));
        }.bind(this));
    },

    //提示玩家出牌
    onHintPlayer:function(data) {
        console.log('-----onHintPlayer-----')
        clientEvent.dispatch(clientEvent.eventType.onHintPlayer, data);
    },

    //翻牌
    onOpenPiece: function(data) {
        console.log('-----onOpenPiece-----')
        if(GLB.userInfo.id == data.uid) { //过滤掉自己的操作
            return
        }
        clientEvent.dispatch(clientEvent.eventType.onOpenPiece, data);
    },

    //移动
    onMovePiece: function(data) {
        console.log('-----onMovePiece-----')
        if(GLB.userInfo.id == data.uid) { //过滤掉自己的操作
            return
        }
        clientEvent.dispatch(clientEvent.eventType.onMovePiece, data);
    },

    //吃牌
    onEatPiece: function(data) {
        console.log('-----onEatPiece-----')
        if(GLB.userInfo.id == data.uid) { //过滤掉自己的操作
            return
        }
        clientEvent.dispatch(clientEvent.eventType.onEatPiece, data);
    },

    //聊天表情
    onShowEnjoy: function(data) {
        console.log('-----onShowEnjoy-----')
        clientEvent.dispatch(clientEvent.eventType.onShowEnjoy, data);
    },

    //结算
    onGameEnd:function(data) {
        console.log('-----onGameEnd-----')
        clientEvent.dispatch(clientEvent.eventType.onGameEnd, data);
    }
});
