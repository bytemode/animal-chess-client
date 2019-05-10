window.clientEvent = {
    eventType: {
        openUI: "openUI",
        closeUI: "closeUI",
        gameStart: "gameStart",
        gameOver: "gameOver",
        roundStart: "roundStart",
        time: "time",
        score: "score",

        playerAccountGet: "playerAccountGet",
        initResponse: "initResponse",
        errorResponse: "errorResponse",
        joinRoomResponse: "joinRoomResponse",
        joinRoomNotify: "joinRoomNotify",
        leaveRoomResponse: "leaveRoomResponse",
        leaveRoomNotify: "leaveRoomNotify",
        joinOverResponse: "joinOverResponse",
        createRoomResponse: "createRoomResponse",
        getRoomListResponse: "getRoomListResponse",
        getRoomDetailResponse: "getRoomDetailResponse",
        getRoomListExResponse: "getRoomListExResponse",
        kickPlayerResponse: "kickPlayerResponse",
        kickPlayerNotify: "kickPlayerNotify",
        leaveRoomMedNotify:"leaveRoomMedNotify",

        updateTime: "updateTime",
        eatForChess: "eatForChess",
        checkMoveDirection: "checkMoveDirection",
        openChessPiece: "openChessPiece",
        isGameOver: "isGameOver",
        mapInit: "mapInit",
        countTime: "countTime",
        changeFlag: "changeFlag",
        openForOther: "openForOther",
        eatForOther: "eatForOther",
        getMap: "getMap",
        stopTimeWarnAnim: "stopTimeWarnAnim",
        clearChess: "clearChess",

        //-------------------------------------------
        onDuanPai: "onDuanPai",       //发牌
        onHintPlayer: "onHintPlayer", //提示出牌
        onOpenPiece:"onOpenPiece",
        onMovePiece: "onMovePiece",
        onEatPiece: "onEatPiece",
        onShowEnjoy: "onShowEnjoy", //聊天表情
        onGameEnd: "onGameEnd",
        InitMap: "InitMap", //初始化棋盘
    },

    eventListener: null
}

clientEvent.init = function() {
    clientEvent.eventListener = eventListener.create();
};

clientEvent.on = function(eventName, handler, target) {
    if (typeof eventName !== "string") {
        return;
    }
    clientEvent.eventListener.on(eventName, handler, target);
};

clientEvent.off = function(eventName, handler, target) {
    if (typeof eventName !== "string") {
        return;
    }
    clientEvent.eventListener.off(eventName, handler, target);
};

clientEvent.clear = function(target) {
    clientEvent.eventListener.clear(target);
};

clientEvent.dispatch = function(eventName, data) {
    if (typeof eventName !== "string") {
        return;
    }
    clientEvent.eventListener.dispatch(eventName, data);
};