var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");

cc.Class({
    extends: uiPanel,

    properties: {},

    start() {
        this.initListener()
        this.initUI()
    },

    onEnable() {
        GLB.isRoomOwner = false;
        GLB.MAX_PLAYER_COUNT = 2;
    },

    initListener: function(){
        this.nodeDict["randomRoom"].on("click", this.randomRoom, this);
        this.nodeDict["createRoom"].on("click", this.createRoom, this);
        this.nodeDict["joinRoom"].on("click", this.joinRoom, this);
        this.nodeDict["inviteFriend"].on("click", this.inviteFriend, this);
        this.nodeDict["exit"].on("click", this.exit, this);
        this.nodeDict["name"].getComponent(cc.Label).string = GLB.userInfo.id;
        this.nodeDict["rank"].on("click", this.rank, this);

        clientEvent.on(clientEvent.eventType.createRoomResponse, this.createRoomResponse, this);
    },

    initUI:function(){
        if (Game.GameManager.nickName) {
            this.nodeDict["name"].getComponent(cc.Label).string = Game.GameManager.nickName;
        } else {
            this.nodeDict["name"].getComponent(cc.Label).string = GLB.userInfo.id;
        }
        if (Game.GameManager.avatarUrl) {
            cc.loader.load({url: Game.GameManager.avatarUrl, type: 'png'}, function(err, texture) {
                var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                if (this.node){
                    this.nodeDict["userIcon"].getComponent(cc.Sprite).spriteFrame = spriteFrame;
                }
            }.bind(this));
        }
        if (!Game.GameManager.network.isConnected()) {
            Game.GameManager.network.connect(GLB.IP, GLB.PORT, function() {
                Game.GameManager.network.send("connector.entryHandler.login", {
                    "account": GLB.userInfo.id + "",
                    "channel": "0",
                    "userName": Game.GameManager.nickName ? Game.GameManager.nickName : GLB.userInfo.id + "",
                    "headIcon": Game.GameManager.avatarUrl ? Game.GameManager.avatarUrl : "-"
                });
            });
        }
    },

    //排行榜
    rank: function() {
        Game.GameManager.blockInput();
    },

    //退出
    exit: function() {
        mvs.engine.logout("");

        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    //随机匹配
    randomRoom: function() {
        Game.GameManager.blockInput();

        GLB.matchType = GLB.RANDOM_MATCH; //随机匹配
        console.log('开始随机匹配');
        if (GLB.gameType === GLB.COOPERATION) {   //匹配
            if (GLB.MAX_PLAYER_COUNT > 1) {
                uiFunc.openUI("uiMatchingVer", function(obj) {
                    var matching = obj.getComponent("uiMatching");
                    matching.joinRandomRoom();
                });
            } else {
                cc.director.loadScene('game');
            }
        } else if (GLB.gameType === GLB.COMPETITION) { //比赛
            if (GLB.MAX_PLAYER_COUNT === 2) {
                uiFunc.openUI("uiMatching1v1Ver", function(obj) {
                    var matching = obj.getComponent("uiMatching1v1Ver");
                    matching.joinRandomRoom();
                });
            } else if (GLB.MAX_PLAYER_COUNT === 4) {
                uiFunc.openUI("uiMatching2v2Ver", function(obj) {
                    var matching = obj.getComponent("uiMatching2v2Ver");
                    matching.joinRandomRoom();
                });
            }
        }
    },

    //创建房间
    createRoom: function() {
        //uiFunc.openUI("uiCreateRoomVer");
        Game.GameManager.blockInput();

        var create = new mvs.CreateRoomInfo();
        create.roomName = "test";
        GLB.MAX_PLAYER_COUNT = 2;
        create.maxPlayer = GLB.MAX_PLAYER_COUNT;
        create.mode = 0;
        create.canWatch = 0;
        create.visibility = 1;
        create.roomProperty = GLB.MAX_PLAYER_COUNT;
        var result = mvs.engine.createRoom(create, { maxPlayer: GLB.MAX_PLAYER_COUNT });
        if (result !== 0) {
            console.log('创建房间失败,错误码:' + result);
        }
    },

    //加入房间
    joinRoom: function() {
        uiFunc.openUI("uiRoomListVer");
    },

    //邀请
    inviteFriend: function() {
        if(window.wx) {
            wx.shareAppMessage({imageUrl: "https://data.tianziyou.com/matchvsGamesRes/logo/animalCheckerLogo1.png"});
        }
    },
    
    createRoomResponse: function(data) {
        var status = data.rsp.status;
        if (status !== 200) {
            console.log('创建房间失败,异步回调错误码: ' + status);
        } else {
            console.log('创建房间成功:' + JSON.stringify(data.rsp));
            console.log('房间号: ' + data.rsp.roomID);
            GLB.roomId = data.rsp.roomID;

            uiFunc.openUI("uiRoomVer", function(obj) {
                var room = obj.getComponent('uiRoom');
                room.createRoomInit(data.rsp);
                uiFunc.closeUI(this.node.name);
                this.node.destroy();
            }.bind(this));
        }
    },

    onDestroy: function() {
        clientEvent.off(clientEvent.eventType.createRoomResponse, this.createRoomResponse, this);
    }

});
