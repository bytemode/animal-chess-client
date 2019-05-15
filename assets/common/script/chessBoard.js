var pool = require("pool");
var GLB = require("Glb");

cc.Class({
    extends: cc.Component,

    properties: {
        chess: cc.Prefab,
        nextStep: cc.Prefab,
        selectPiece: -1
    },

    onLoad () {
        pool.createPrefabPool(this.chess);

        this.init();
        this.fPosList = [];
        this.playing = false;
        clientEvent.on(clientEvent.eventType.InitMap, this.initMap, this);
        clientEvent.on(clientEvent.eventType.onOpenPiece, this.onOpenPiece, this);
        clientEvent.on(clientEvent.eventType.onMovePiece, this.onMovePiece, this);
        clientEvent.on(clientEvent.eventType.onEatPiece, this.onEatPiece, this)
    },

    init () {
    },

    getChessNodeByTag:function (tag) {
        for(var i = 0; i < this.showChessArr.length; i++)
        {
            if(this.showChessArr[i].sign === tag)
            {
                return this.showChessArr[i];
            }
        }
    },

    getTagByIndex:function (index) {
        for(var i = 0; i < this.showChessArr.length; i++)
        {
            var scrip = this.showChessArr[i].getComponent(this.chess.name);
            if(scrip.getIndex() === index)
            {
                return this.showChessArr[i];
            }
        }
    },

    onDestroy () {
        clientEvent.off(clientEvent.eventType.InitMap, this.initMap, this);
    },

    //棋盘点击事件
    clickPieceCallback: function( event, customEventData ){
        console.log("chess click", event.target, customEventData)
        if (Game.GameManager.gameState !== GameState.Play) return;

        if(Game.GameManager.logic.isMyRound()){
            this.handleInput(parseInt(customEventData))
        }else{
            console.log("is not my round!")
            uiFunc.openUI('uiRoundTip', function (panel) {
                var uiRoundTip = panel.getComponent('uiRoundTip');
                uiRoundTip.setData(GLB.ROUND_TIP.OTHER);
            })
        }
    },

    //初始化棋盘
    initMap: function(){
        this.showChessArr = []

        //获取地图数据 进行界面初始化
        var pieces = Game.GameManager.logic.getPieces()
        for(var i = 0; i < 16; i++){
            var piecesB = this.node.getChildByName("piece_" + i.toString())

            var chessNode = pool.getPrefab(this.chess.name);
            this.node.addChild(chessNode);
            chessNode.x = piecesB.x
            chessNode.y = piecesB.y
            var chessScript = chessNode.getComponent(this.chess.name);
            chessScript.setIndex(i)
            chessScript.setChessType(pieces[i]);
            this.showChessArr.push(chessNode);
        }
    },

    //处理用户操作
    handleInput: function(index){
        var pieceValue = Game.GameManager.logic.getPieceByIndex(index)
        console.log("handleInput:", pieceValue)
        if(pieceValue == -1){
            nano.notify("game.OpenPiece", {"index": index})
        }
        else if(pieceValue == 0){
            //之前有选中的索引则判断是否可以进行移动操作
            if(this.selectPiece != -1){
                if(Game.GameManager.logic.isCanMove(this.selectPiece, index)){
                    nano.notify("game.MovePiece", {"indexSrc": this.selectPiece, "indexDest": index})
                }
            }
        }
        else if(pieceValue > 0){
            if(Game.GameManager.logic.isMyPiece(pieceValue)){
                if(this.selectPiece == index ){
                    return
                }

                //点击的是自己的则执行选中逻辑
                //取消之前的选中，选中现在的选中
                if(this.selectPiece != -1){
                    var chessNode = this.showChessArr[this.selectPiece]
                    var chessScript = chessNode.getComponent(this.chess.name);
                    if(chessScript.getIndex() == this.selectPiece  && chessScript.getType() > 0) {
                        chessScript.animatPutDown()
                    }
                }

                this.selectPiece = index
                var chessNode = this.showChessArr[this.selectPiece]
                var chessScript = chessNode.getComponent(this.chess.name);
                if(chessScript.getIndex() == this.selectPiece  && chessScript.getType() > 0) {
                    chessScript.animatPickup()
                    let dir =  Game.GameManager.logic.getMoveDir(index)
                    chessScript.setMoveDirection(dir)
                }
            }else{
                //点击的是别人的则执行吃牌逻辑
                if(this.selectPiece != - 1){
                    nano.notify("game.EatPiece", {"indexSrc": this.selectPiece, "indexDest": index})
                }
            }
        }
    },

    //翻牌
    onOpenPiece: function(data) {
        console.log("onOpenPiece", data)

        var chessNode = this.showChessArr[data.index]
        var chessScript = chessNode.getComponent(this.chess.name);
        if(chessScript.getIndex() == data.index  && chessScript.getType() == -1) {
            chessScript.setChessType(data.piece)
            chessScript.openChessPiece()
        }
    },

    //移动
    onMovePiece: function(data) {
        console.log("onMovePiece", data)

        var chessNode = this.showChessArr[data.indexSrc]
        var chessScript = chessNode.getComponent(this.chess.name);
        if(chessScript.getIndex() == data.indexSrc  && chessScript.getType() > 0) {
            var destChessNode = this.showChessArr[data.indexDest]
            var destChessScript = destChessNode.getComponent(this.chess.name);
            if(destChessScript.getIndex() == data.indexDest && destChessScript.getType() == 0) {
                if(data.uid == Game.GameManager.uid){
                    this.selectPiece = -1 //清空自己的选择标识

                    //自己的移动操作
                    chessScript.setChessType(0)
                    destChessScript.setChessType(Game.GameManager.logic.getPieceByIndex(data.indexDest)) //设置类型
                    destChessScript.animatPutDown()
                }else{
                    //别人的移动操作
                    chessScript.animatPickup(function(){
                        chessScript.setChessType(0)
                        destChessScript.setChessType(Game.GameManager.logic.getPieceByIndex(data.indexDest)) //设置类型
                        destChessScript.animatPutDown()
                    }.bind(this))
                }
            }
        }
    },

    onEatPiece: function(data) {
        console.log("onEatPiece:", data)
        if(data.code == 1){
            //吃
            var chessNode = this.showChessArr[data.indexSrc]
            var chessScript = chessNode.getComponent(this.chess.name);
            if(chessScript.getIndex() == data.indexSrc  && chessScript.getType() > 0) {
                var destChessNode = this.showChessArr[data.indexDest]
                var destChessScript = destChessNode.getComponent(this.chess.name);
                if(destChessScript.getIndex() == data.indexDest && destChessScript.getType() > 0) {
                    if(data.uid == Game.GameManager.uid){
                        this.selectPiece = -1 //清空自己的选择标识
    
                        //自己的吃操作
                        chessScript.setChessType(0)
                        destChessScript.setChessType(Game.GameManager.logic.getPieceByIndex(data.indexDest)) //设置类型
                        destChessScript.animatPutDown()
                    }else{
                        //别人的吃操作
                        chessScript.animatPickup(function(){
                            chessScript.setChessType(0)
                            destChessScript.setChessType(Game.GameManager.logic.getPieceByIndex(data.indexDest)) //设置类型
                            destChessScript.animatPutDown()
                        }.bind(this))
                    }
                }
            }
        }else if(data.code == 2){
            //被吃
            this.selectPiece = -1
            var chessNode = this.showChessArr[data.indexSrc]
            var chessScript = chessNode.getComponent(this.chess.name);
            if(chessScript.getIndex() == data.indexSrc  && chessScript.getType() > 0) {
                chessScript.animatPutDown(function(){
                    chessScript.setChessType(0)
                }.bind(this))
            }
        }else if(data.code == 3){
            //同归
            var chessNode = this.showChessArr[data.indexSrc]
            var chessScript = chessNode.getComponent(this.chess.name);
            if(chessScript.getIndex() == data.indexSrc  && chessScript.getType() > 0) {
                var destChessNode = this.showChessArr[data.indexDest]
                var destChessScript = destChessNode.getComponent(this.chess.name);
                if(destChessScript.getIndex() == data.indexDest && destChessScript.getType() > 0) {
                    if(data.uid == Game.GameManager.uid){
                        this.selectPiece = -1 //清空自己的选择标识
    
                        //自己的吃操作
                        chessScript.setChessType(0)
                        destChessScript.animatPutDown(function(){
                            destChessScript.setChessType(0)
                        }.bind(this))
                    }else{
                        //别人的吃操作
                        chessScript.animatPickup(function(){
                            chessScript.setChessType(0)
                            destChessScript.animatPutDown(function(){
                                destChessScript.setChessType(0)
                            }.bind(this))
                        }.bind(this))
                    }
                }
            }
        }
    },
});
