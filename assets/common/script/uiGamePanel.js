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

        clientEvent.on(clientEvent.eventType.updateTime, this.updateTime, this);
        clientEvent.on(clientEvent.eventType.countTime, this.countTime, this);
        clientEvent.on(clientEvent.eventType.changeFlag, this.changeFlag, this);
        clientEvent.on(clientEvent.eventType.roundStart, this.roundStart, this);
        clientEvent.on(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.on(clientEvent.eventType.stopTimeWarnAnim, this.stopTimeWarnAnim, this);
    },

    gameOver () {
        this.stopTimeWarnAnim();
        this.setTimeNumFont();
        clearInterval(this.interval);
    },

    setTimeNumFont () {
        this.timeNumLabel.fontSize = 35;
    },

    roundStart () {
        console.log('------roundStart------')
        this.timeLabelInit();
        clearInterval(this.interval);
        this.playerFlag = GLB.PLAYER_FLAG.RED;
        user.init();
        this.headColorInit();
        clientEvent.dispatch(clientEvent.eventType.getMap);
        this.playReadyGo();
        this.setTimeNumFont();
        this.setHeadIcon();
    },

    exit() {
        uiFunc.openUI("uiExit");
    },

    countTime () {
        clearInterval(this.interval);
        if (!GLB.isRoomOwner || Game.GameManager.gameState !== GameState.Play) return;
        this.time = 30;
        this.countDownEvent();
        this.interval = setInterval(function() {
            this.time--;
            this.countDownEvent();
            if (this.time <= 0) {
                if (Game.GameManager.gameState === GameState.Play) {
                    console.log('超时；获胜方====' + (this.playerFlag === GLB.PLAYER_FLAG.RED ? '蓝色':'红色'));
                    var winFlag = this.playerFlag === GLB.PLAYER_FLAG.RED ? GLB.PLAYER_FLAG.BLUE : GLB.PLAYER_FLAG.RED
                    // Game.GameManager.gameState = GameState.Over;
                    var msg = {
                        action: GLB.GAME_OVER_EVENT,
                        winFlag: winFlag
                    }
                    Game.GameManager.sendEvent(msg);
                    clientEvent.dispatch(clientEvent.eventType.gameOver, winFlag);
                }
                clearInterval(this.interval);
                this.interval = null;

            }
        }.bind(this), 1000);
    },

    changeFlag () {
        this.playerFlag === GLB.PLAYER_FLAG.RED ? this.playerFlag = GLB.PLAYER_FLAG.BLUE :this.playerFlag = GLB.PLAYER_FLAG.RED;
        this.getTurn(this.playerFlag);
        if (user.isMyTurn) {
            uiFunc.openUI('uiRoundTip', function (panel) {
                var uiRoundTip = panel.getComponent('uiRoundTip');
                uiRoundTip.setData(GLB.ROUND_TIP.SELF);
            })
        }
        this.countTime();
    },

    getTurn (flag) {
        // var flag = this.playerFlag;
        var preTurn = user.isMyTurn;
        if(GLB.isRoomOwner && flag === GLB.PLAYER_FLAG.RED) {
            user.isMyTurn = true;
        } else if(!GLB.isRoomOwner && flag === GLB.PLAYER_FLAG.BLUE){
            user.isMyTurn = true;
        } else {
            user.isMyTurn = false;
        }
        if (preTurn === user.isMyTurn) return;
        this.showCurTurnLabel();
        this.timeNode.active = true;
    },

    //显示回合信息
    showCurTurnLabel () {
        if (user.isMyTurn) {
            this.timeLeftNode.active = true;
            this.timeRightNode.active = false;
        } else {
            this.timeLeftNode.active = false;
            this.timeRightNode.active = true;
        }
    },

    updateTime (param) {
        // if (Game.GameManager.gameState !== GameState.Play) return;
        var side = null;
        var time = param.time;
        if (time <= 5 && time > 0) {
            this.playTimeWarnAnim();
        }
        if (time <= 0) {
            this.stopTimeWarnAnim();
        }
        this.getTurn(param.flag);
        user.isMyTurn ? side = 'Left' : side = 'Right';
        this.timeNumLabel.string = time;
    },

    onDestroy () {
        console.log('uiGamePanel onDestroy');
        clearInterval(this.interval);
        clientEvent.off(clientEvent.eventType.updateTime, this.updateTime, this);
        clientEvent.off(clientEvent.eventType.countTime, this.countTime, this);
        clientEvent.off(clientEvent.eventType.changeFlag, this.changeFlag, this);
        clientEvent.off(clientEvent.eventType.roundStart, this.roundStart, this);
        clientEvent.off(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.off(clientEvent.eventType.stopTimeWarnAnim, this.stopTimeWarnAnim, this);
    },


    //----------------------------------------------------------------------
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
        this.timeNode.getChildByName('num').setScale(1, 1);
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
    setHeadIcon () {
        this.leftHead.getComponent('playerIcon').setData({id: GLB.playerUserIds[0]});
        this.rightHead.getComponent('playerIcon').setData({id: GLB.playerUserIds[1]});
    },

    //收到发牌消息,游戏开始
    gameStart (){
        console.log("uiGamePanel", "gameStart")
        Game.GameManager.gameState = GameState.Play;

        //初始化红蓝头像 初始化箭头等红蓝信息 自己在左侧
        this.headColorInit()

        //设置头像信息
        this.setHeadIcon()

        //初始化时间信息
        this.timeLabelInit()

        //初始化棋盘

        //播放readygo动画完成之后开始回合的通知
        this.playReadyGo()
    },

    //read go 之后开始通知服务器客户端准备完成
    notifyReady (){
        nano.notify("game.QiPaiFinished", {}) 
    },
});
