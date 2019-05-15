var GLB = require("Glb");

cc.Class({
    extends: cc.Component,

    properties: {
        chessPiecesArr: [cc.SpriteFrame], //棋子图片 1~8 是红色 9~16是蓝色
    },

    onLoad () {
        ////背景
        this.backImgNode = this.node.getChildByName('backImg');

        //四个箭头
        this.leftNode   = this.node.getChildByName('left');
        this.rightNode  = this.node.getChildByName('right');
        this.upNode     = this.node.getChildByName('up');
        this.downNode   = this.node.getChildByName('down');

        //烟雾
        this.yanwuNode = this.node.getChildByName('yanwu');

        this.chessNode = this.node.getChildByName('chessNode');
        //棋子icon
        this.chessPieceNode = this.chessNode.getChildByName('chessPiece');


        this.leftNode.active    = false;
        this.rightNode.active   = false;
        this.upNode.active      = false;
        this.downNode.active    = false;
        this.yanwuNode.active   = false;
        this.chessNode.active   = false;
        this.backImgNode.active = true;

        this.isOpen             = false;
        this.isMoving           = false;
        this.type               = -1;
        this.camp               = 0;
    },

    setIndex: function(pos) {
        this.pos  = pos  //棋牌位置
    },

    //设置棋子数据 位置和值
    setChessType: function (type) {
        this.type = type //棋子的值
        
        if(type > 0 ) {
            this.node.active = true

            //设置棋子
            this.chessPieceNode.setScale(1);
            this.camp = Game.GameManager.logic.getCampByType(type) //阵营
            this.chessPieceNode.getComponent(cc.Sprite).spriteFrame = this.chessPiecesArr[type-1]; //设置图片
        }
        else if(type == 0){
            this.node.active = false
        }
        else if(type == -1){
            //未翻开
            this.node.active = true
            this.backImgNode.active = true;
        }
    },

    //翻开棋子 需要先设置棋子数据 然后才可以翻棋子
    openChessPiece:function () {
        // 播放音乐
        user.setAudio((this.type - 1) % 8);

        //播放翻开时底部动画 
        this.backImgNode.getComponent(cc.Animation).play("openAnm").on("finished", function() {
            //完成之后隐藏底部动画 显示棋子节点播放云动画
            this.isOpen = true

            this.backImgNode.active = false;
            this.chessNode.active = true;
            this.yanwuNode.active = true;
            this.yanwuNode.getComponent(cc.Animation).play("yanwu");
        }.bind(this));
    },

    setPosition: function(x, y) {
        this.node.setPosition.apply(this.node, arguments);
    },

    getPosition () {
        return this.node.getPosition();
    },

    getNode:function(){
        return this.node;
    },

    getIndex:function() {
        return this.pos;
    },

    getType:function(){
        return this.type;
    },

    getAnimateStep:function() {
        if (this.pickUp) {
            if (this.pickUp.isPlaying === true) {
                return true
            }
        }

        if (this.putDown) {
            if (this.putDown.isPlaying === true) {
                return true
            }
        }
        return false;
    },

    clearDirection:function() {
        this.node.zIndex        = 0;
        this.leftNode.active    = false;
        this.rightNode.active   = false;
        this.upNode.active      = false;
        this.downNode.active    = false;
    },

    setMoveDirection:function (data) { //left  right up down
        if(data.left){
            this.leftNode.active = data.left;
            if(data.largeThanleft)
            {
                this.leftNode.color = new cc.color("#FFFFFF");
            }
            else{
                this.leftNode.color = new cc.color("#FF4E4E");
            }
        }

        if(data.right){
            this.rightNode.active = data.right;
            if(data.largeThanright)
            {
                this.rightNode.color = new cc.color("#FFFFFF");
            }
            else{
                this.rightNode.color = new cc.color("#FF4E4E");
            }
        }

        if(data.up){
            this.upNode.active = data.up;
            if(data.largeThanup)
            {
                this.upNode.color = new cc.color("#FFFFFF");
            }
            else{
                this.upNode.color = new cc.color("#FF4E4E");
            }
        }

        if(data.down){
            this.downNode.active = data.down;
            if(data.largeThandown)
            {
                this.downNode.color = new cc.color("#FFFFFF");
            }
            else{
                this.downNode.color = new cc.color("#FF4E4E");
            }
        }
    },

    animatPickup: function(cb) {
        this.node.zIndex = 100;
        this.pickUp = this.chessNode.getComponent(cc.Animation).play("pickUp").once("finished",function() {
            if(cb) {
                cb();
            }
        }.bind(this))
    },

    animatPutDown:function(cb) {
        this.putDown  = this.chessNode.getComponent(cc.Animation).play("putDown").once("finished",function() {
            this.clearDirection()

            this.yanwuNode.active = true;
            this.yanwuNode.getComponent(cc.Animation).play("yanwu").once("finished",function() {
                this.yanwuNode.active = false;
                if (cb) {
                    cb();
                }
            }.bind(this));
        }.bind(this));
    },

    animationYanwu: function(cb){
        this.yanwuNode.active = true;
        this.yanwuNode.getComponent(cc.Animation).play("yanwu").once("finished",function() {
            this.yanwuNode.active = false;
            if (cb) {
                cb();
            }
        }.bind(this));
    },

    setDestory:function(){
        this.isOpen = false
        this.node.active = false;
    },

    onDestroy () {
    }
});
