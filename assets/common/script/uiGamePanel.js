var GLB = require("Glb");

cc.Class({
    extends: cc.Component,

    properties: {
        redHeadBg: cc.SpriteFrame, // 红蓝头像框图片
        blueHeadBg: cc.SpriteFrame,

        redArrow: cc.SpriteFrame,// 红蓝箭头图片
        blueArrow: cc.SpriteFrame,

        //左右头像框
        leftHeadBg: {
            default: null,
            type: cc.Sprite
        },

        rightHeadBg: {
            default: null,
            type: cc.Sprite
        },

        //左右头像 左边默认是自己
        leftHead: {
            default: null,
            type: cc.Sprite
        },

        rightHead:{
            default: null,
            type:cc.Sprite
        },

        //左右箭头
        leftArrowSprite: {
            default: null,
            type: cc.Sprite
        },

        rightArrowSprite:{
            default: null,
            type:cc.Sprite
        },
    },

    onLoad () {
        //回合时间节点
        this.timeNode = this.node.getChildByName('time');
        this.timeLeftNode = this.timeNode.getChildByName('left'); //我方
        this.timeRightNode = this.timeNode.getChildByName('right'); //他仿
        this.timeLeftNode.active = false
        this.timeRightNode.active = false

        //倒计时
        this.timeNumNode = this.timeNode.getChildByName('num');
        this.timeNumLabel = this.timeNumNode.getComponent(cc.Label);
        //时间动画
        this.timeAnim = this.timeNumNode.getComponent(cc.Animation);

        //readygo ani
        this.readyNode = this.node.getChildByName('readyGo');
        this.readyAnim = this.readyNode.getComponent(cc.Animation);
        this.readyAnim.on('finished', this.notifyReady, this);

        //this.readyGoAudio = this.readyNode.getComponent(cc.AudioSource);

        clientEvent.on(clientEvent.eventType.onHintPlayer, this.onHintPlayer, this);
        clientEvent.on(clientEvent.eventType.stopTimeWarnAnim, this.stopTimeWarnAnim, this);
        clientEvent.on(clientEvent.eventType.onShowEnjoy, this.onShowEnjoy, this);
        clientEvent.on(clientEvent.eventType.onGameEnd, this.onGameEnd, this);
    },

    gameOver () {
        this.stopTimeWarnAnim();
        this.setTimeNumFont();
        clearInterval(this.interval);
    },


    exit() {
        uiFunc.openUI("uiExit");
    },

    onDestroy () {
        console.log('uiGamePanel onDestroy');
        clearInterval(this.interval);
        clientEvent.off(clientEvent.eventType.onHintPlayer, this.onHintPlayer, this);
        clientEvent.off(clientEvent.eventType.stopTimeWarnAnim, this.stopTimeWarnAnim, this);
        clientEvent.off(clientEvent.eventType.onShowEnjoy, this.onShowEnjoy, this);
        clientEvent.off(clientEvent.eventType.onGameEnd, this.onGameEnd, this);
    },

    countTime () {
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        if (Game.GameManager.gameState !== GameState.Play) return;

        this.time = 30;
        this.interval = setInterval(function(){
            console.log("countTime", this.time)
            if (Game.GameManager.gameState == GameState.Play){
                this.time--;
                if (this.time <= 0) {
                    clearInterval(this.interval);
                    this.interval = null;
                }
                this.updateTime(this.time)
            }
        }.bind(this), 1000);
    },


    updateTime (time) {
        if (time == 5) {
            this.playTimeWarnAnim();
        }

        if (time <= 0) {
            this.stopTimeWarnAnim();
        }

        this.timeNode.active = true;
        this.timeNumLabel.string = time;
    },

    setTimeNumFont () {
        this.timeNumLabel.fontSize = 35;
    },

    playReadyGo() {
        this.readyAnim.play();
        //this.readyGoAudio.play();
    },

    playTimeWarnAnim () {
        this.timeAnim.play();
    },

    stopTimeWarnAnim () {
        this.timeAnim.stop();
    },

    //初始化时间控件
    timeLabelInit () {
        this.timeNode.active = false;
        this.timeNumLabel.string = 30;
        //this.timeNode.getChildByName('num').setScale(1, 1);
    },

    //初始化头像信息
    headColorInit () {
        //我方头像放置在左侧
        var camp = Game.GameManager.logic.getCampById(Game.GameManager.uid) //1 为红 2 为蓝
        if (camp == 1){
            this.leftArrowSprite.spriteFrame = this.redArrow;
            this.leftHeadBg.spriteFrame = this.redHeadBg;

            this.rightArrowSprite.spriteFrame = this.blueArrow;
            this.rightHeadBg.spriteFrame = this.blueHeadBg;
        }else{
            this.leftArrowSprite.spriteFrame = this.blueArrow;
            this.leftHeadBg.spriteFrame = this.blueHeadBg;

            this.rightArrowSprite.spriteFrame = this.redArrow;
            this.rightHeadBg.spriteFrame = this.redHeadBg;
        }
    },

    //设置头像
    setHeadInfo () {
        this.timeNode = this.node.getChildByName('name');
        var camps = Game.GameManager.logic.getCamps()
        for (var index = 0; index < camps.length; index++){
            if (camps[index].uid == Game.GameManager.uid){
                this.leftName = this.timeNode.getChildByName('leftName'); //我方
                this.leftName.getComponent(cc.Label).string = camps[index].name;
                this.leftHead.getComponent('playerIcon').setData(camps[index]);
            }else{
                this.rightName = this.timeNode.getChildByName('rightName'); //他仿
                this.rightName.getComponent(cc.Label).string = camps[index].name;
                this.rightHead.getComponent('playerIcon').setData(camps[index]);
            }
        }
    },


    //收到发牌消息,游戏开始
    gameStart (){
        console.log("uiGamePanel", "gameStart")
        Game.GameManager.gameState = GameState.Play;

        //初始化红蓝头像 初始化箭头等红蓝信息 自己在左侧
        this.headColorInit()

        //设置头像信息
        this.setHeadInfo()

        //初始化时间信息
        this.timeLabelInit()

        //初始化棋盘
        this.initPieces()

        //播放readygo动画完成之后开始回合的通知
        this.playReadyGo()
    },

    //初始化棋子
    initPieces (){
        clientEvent.dispatch(clientEvent.eventType.InitMap);
    },

    //read go 之后开始通知服务器客户端准备完成
    notifyReady (){
        nano.notify("game.QiPaiFinished", {}) 
    },


    //提示出牌 并且开始倒计时
    onHintPlayer (){
        console.log("onHintPlayer")
        
        this.showCurTurnLabel()
        this.setTimeNumFont()
        this.countTime()
    },

    //显示回合信息
    showCurTurnLabel () {
        //自己始终在左边
        if (Game.GameManager.logic.isMyRound()) {
            this.timeLeftNode.active = true;
            this.timeRightNode.active = false;
        } else {
            this.timeLeftNode.active = false;
            this.timeRightNode.active = true;
        }
    },

    //聊天表情
    onShowEnjoy (data){
        console.log("onShowEnjoy", data) //uid index 聊天索引
    },

    //游戏结算
    onGameEnd (data) {
        console.log("onGameEnd", data) // winner 胜利的uid  coin  camp // 0 平局 1  2   giveup 是否放弃  timeOut 是否超时

        uiFunc.openUI("uiVsResultVer", function(panel) {
            //初始化游戏包括敌我双向 棋盘信息
            panel.getComponent("uiVsResult").setData(data);
        }.bind(this));
    }
});
