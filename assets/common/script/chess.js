var GLB = require("Glb");

cc.Class({
    extends: cc.Component,

    properties: {
        bgColor: [cc.SpriteFrame], //棋子红蓝背景
        blueChessPiecesArr: [cc.SpriteFrame], //红方棋子
        redChessPiecesArr: [cc.SpriteFrame] //蓝色棋子
    },

    onLoad () {
        this.chessNode = this.node.getChildByName('chessNode');
        this.yanwuNode = this.node.getChildByName('yanwu');
        this.backImgNode = this.node.getChildByName('backImg');

        //方向节点
        this.leftNode = this.node.getChildByName('left');
        this.rightNode = this.node.getChildByName('right');
        this.upNode = this.node.getChildByName('up');
        this.downNode = this.node.getChildByName('down');

        this.leftNode.active = false;
        this.rightNode.active = false;
        this.upNode.active = false;
        this.downNode.active = false;

        this.yanwuNode.active = false;
        this.isOpen = false;
        this.isMoving = false;

        clientEvent.on(clientEvent.eventType.openChessPiece, this.openChessPieceEvent, this);
    },

    setChessType:function (type,index) {
       this.chessPieceNode = this.node.getChildByName('chessNode').getChildByName('chessPiece');
        if(type === GLB.PLAYER_FLAG.BLUE)
        {
            this.chessPieceNode.setScale(1);
            this.chessPieceNode.getComponent(cc.Sprite).spriteFrame = this.blueChessPiecesArr[index-1];

        }
        else if(type === GLB.PLAYER_FLAG.RED){
            this.chessPieceNode.setScale(1);
            this.chessPieceNode.getComponent(cc.Sprite).spriteFrame = this.redChessPiecesArr[index-10-1];
        }

        this.type = type;
        this.index = index - 1;
    },

    //翻开棋子消息
    openChessPieceEvent (tag) {
        if (this.node.tag !== tag) return;
        this.openChessPiece();
    },

    //翻开棋子
    openChessPiece:function () {
        // 播放音乐
        user.setAudio(this.index % 10);
        user.stepIfEatOrOpen(2);
        //播放翻开棋子动画播放完毕之后展开云朵和棋子然后播放云朵动画
        this.backImgNode.getComponent(cc.Animation).play("openAnm").on("finished",function() {
            this.backImgNode.active = false;
            this.chessNode.active = true;
            this.yanwuNode.active = true;
            this.yanwuNode.getComponent(cc.Animation).play("yanwu");
        }.bind(this));

        setTimeout(function() {
            clientEvent.dispatch("isGameOver");
        }.bind(this), 1000);
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
        return this.index + 1;
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
        this.leftNode.active = false;
        this.rightNode.active = false;
        this.upNode.active = false;
        this.downNode.active = false;
        this.node.setLocalZOrder(0);
    },

    setMoveDirection:function (data, cb) {
        this.pickUp = this.chessNode.getComponent(cc.Animation).play("pickUp");
        this.node.setLocalZOrder(100);
        if(data.left)
        {
            this.leftNode.active = data.left;
            if(data.largeThanleft)
            {
                this.leftNode.color = new cc.color("#FFFFFF");
            }
            else{
                this.leftNode.color = new cc.color("#FF4E4E");
            }
        }
        if(data.right)
        {
            this.rightNode.active = data.right;
            if(data.largeThanright)
            {
                this.rightNode.color = new cc.color("#FFFFFF");
            }
            else{
                this.rightNode.color = new cc.color("#FF4E4E");
            }
        }
        if(data.up)
        {
            this.upNode.active = data.up;
            if(data.largeThanup)
            {
                this.upNode.color = new cc.color("#FFFFFF");
            }
            else{
                this.upNode.color = new cc.color("#FF4E4E");
            }
        }
        if(data.down)
        {
            this.downNode.active = data.down;
            if(data.largeThandown)
            {
                this.downNode.color = new cc.color("#FFFFFF");
            }
            else{
                this.downNode.color = new cc.color("#FF4E4E");
            }
        }
        if (cb) {
            cb();
        }
    },

    animatPutDown:function(cb,parm) {
        if (this.chessNode.scale === 1.2) {
            this.putDown  = this.chessNode.getComponent(cc.Animation).play("putDown").on("finished",function() {
                if (parm) {
                    cb();
                    return;
                }
                if (!cb) {
                    return;
                }
                this.yanwuNode.active = true;
                this.yanwuNode.getComponent(cc.Animation).play("yanwu").on("finished",function() {
                    this.yanwuNode.active = false;
                    if (cb) {
                        cb();
                    }
                }.bind(this));
            }.bind(this));
        } else {

            if (cb) {
                cb();
            }

        }
    },

    setDestory:function(){
        this.node.active = false;
    },

    start () {

    },

    onDestroy () {
        clientEvent.off(clientEvent.eventType.openChessPiece, this.openChessPieceEvent, this);
    }
});
