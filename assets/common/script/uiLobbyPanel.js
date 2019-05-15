var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: uiPanel,

    properties: {},

    start() {
        this.nodeDict["randomRoom"].on("click", this.randomRoom, this);
        this.nodeDict["createRoom"].on("click", this.createRoom, this);
        this.nodeDict["joinRoom"].on("click", this.joinRoom, this);
        this.nodeDict["inviteFriend"].on("click", this.inviteFriend, this);
        this.nodeDict["exit"].on("click", this.exit, this);
        this.nodeDict["name"].getComponent(cc.Label).string = GLB.userInfo.id;
        this.nodeDict["rank"].on("click", this.rank, this);

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
        clientEvent.on(clientEvent.eventType.onDuanPai, this.onDuanPai, this);
    },

    rank: function() {
        Game.GameManager.blockInput();

        if (!Game.GameManager.network.isConnected()) {
            Game.GameManager.network.connect(GLB.IP, GLB.PORT, function() {
                    Game.GameManager.network.send("connector.entryHandler.login", {
                        "account": GLB.userInfo.id + "",
                        "channel": "0",
                        "userName": Game.GameManager.nickName ? Game.GameManager.nickName : GLB.userInfo.id + "",
                        "headIcon": Game.GameManager.avatarUrl ? Game.GameManager.avatarUrl : "-"
                    });
                    setTimeout(function() {
                        Game.GameManager.network.send("connector.rankHandler.getRankData", {
                            "account": GLB.userInfo.id + "",
                            "game": "game8"
                        });
                    }, 500);
                }
            );
        } else {
            Game.GameManager.network.send("connector.rankHandler.getRankData", {
                "account": GLB.userInfo.id + "",
                "game": "game8"
            });
        }
    },

    onEnable() {
        GLB.isRoomOwner = false;
        GLB.MAX_PLAYER_COUNT = 2;
    },

    randomRoom: function() {
        Game.GameManager.blockInput();

        GLB.matchType = GLB.RANDOM_MATCH; // 修改匹配方式为随机匹配
        console.log('开始随机匹配');
        if (GLB.gameType === GLB.COOPERATION) {
            if (GLB.MAX_PLAYER_COUNT > 1) {
                if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
                    uiFunc.openUI("uiMatchingVer", function(obj) {
                        var matching = obj.getComponent("uiMatching");
                        matching.joinRandomRoom();
                    });
                } else {
                    uiFunc.openUI("uiMatching", function(obj) {
                        var matching = obj.getComponent("uiMatching");
                        matching.joinRandomRoom();
                    });
                }
            } else {
                cc.director.loadScene('game');
            }
        } else if (GLB.gameType === GLB.COMPETITION) {
            if (GLB.MAX_PLAYER_COUNT === 2) {
                if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
                    uiFunc.openUI("uiMatching1v1Ver", function(obj) {
                        var matching = obj.getComponent("uiMatching1v1Ver");
                        matching.joinRandomRoom();
                    });
                } else {
                    uiFunc.openUI("uiMatching1v1", function(obj) {
                        var matching = obj.getComponent("uiMatching1v1");
                        matching.joinRandomRoom();
                    });
                }
            } else if (GLB.MAX_PLAYER_COUNT === 4) {
                if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
                    uiFunc.openUI("uiMatching2v2Ver", function(obj) {
                        var matching = obj.getComponent("uiMatching2v2Ver");
                        matching.joinRandomRoom();
                    });
                } else {
                    uiFunc.openUI("uiMatching2v2Ver", function(obj) {
                        var matching = obj.getComponent("uiMatching2v2Ver");
                        matching.joinRandomRoom();
                    });
                }
            }
        }
    },

    inviteFriend: function() {
        if(window.wx) {
            wx.shareAppMessage({imageUrl: "https://data.tianziyou.com/matchvsGamesRes/logo/animalCheckerLogo1.png"});
        }
    },

    //------------------------------------------------------------------------------------------------
    onDuanPai: function() {
        this.exit()
    },

    exit: function() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    //创建房间
    createRoom: function() {
        nano.request("game.CreateDesk", {"version":"1.9.3", "options":{"mode":1}}, this.createRoomRsp.bind(this))
    },
    
    createRoomRsp: function(data) {
        console.log(data)
        if (data.code == 0){
            console.log("desk id:", data.tableInfo.deskId)

            //打开房间界面
            GLB.roomId = data.tableInfo.deskId;
            uiFunc.openUI("uiRoomVer", function(obj) {
                var room = obj.getComponent('uiRoom');
                room.createRoomInit({"roomID":data.tableInfo.deskId, "owner": data.tableInfo.creator});
            })
        }else{
        }
    },

    //加入房间
    joinRoom: function() {
        uiFunc.openUI("uiRoomListVer");
    },
});
