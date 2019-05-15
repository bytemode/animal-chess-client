var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: uiPanel,

    properties: {
        loseClip: {
            default: null,
            type: cc.AudioClip
        },
        victoryClip: {
            default: null,
            type: cc.AudioClip
        },
        redFrame: cc.SpriteFrame,
        blueFrame: cc.SpriteFrame,
    },

    isWin (flag) {
        if (flag) {
            cc.audioEngine.play(this.victoryClip, false, 1);
        } else {
            cc.audioEngine.play(this.loseClip, false, 1);
        }
        this.nodeDict["lose"].active = !flag;
        this.nodeDict["win"].active = flag;
        this.nodeDict["draw"].active = false;
    },

    draw () {
        this.nodeDict["lose"].active = false;
        this.nodeDict["win"].active = false;
        this.nodeDict["draw"].active = true;
        cc.audioEngine.play(this.victoryClip, false, 1);
    },

    setData (data) {
        //winner   coin  camp // 0 平局 1  2   giveup 是否放弃  timeOut 是否超时
        if(data.camp == 0){
            //平局
            this.draw();
        }else
        {
            if(data.winner == Game.GameManager.uid){
                //赢
                this.isWin(true);
            }else{
                //输
                this.isWin(false);
            }
        }
    },

    setFrameColor () {
        if(GLB.isRoomOwner) {
            this.leftFrameSprite.spriteFrame = this.redFrame;
            this.rightFrameSprite.spriteFrame = this.blueFrame;
        } else {
            this.leftFrameSprite.spriteFrame = this.blueFrame;
            this.rightFrameSprite.spriteFrame = this.redFrame;
        }
    },

    start() {
        this.player = this.nodeDict["player"].getComponent("resultPlayerIcon");
        //this.player.setData(GLB.playerUserIds[0]);
        this.rival = this.nodeDict["rival"].getComponent("resultPlayerIcon");
        //this.rival.setData(GLB.playerUserIds[1]);
        this.nodeDict["vs"].active = true;
        this.nodeDict["score"].active = false;
        this.leftFrameSprite =  this.nodeDict['leftFrame'].getComponent(cc.Sprite);
        this.rightFrameSprite = this.nodeDict['rightFrame'].getComponent(cc.Sprite);
        //this.setFrameColor();

        this.nodeDict["quit"].on("click", this.quit, this);
    },

    quit: function() {
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
            uiFunc.closeUI("uiGamePanel");
            gamePanel.destroy();
        }
        uiFunc.closeUI(this.node.name);
        this.node.destroy();

        Game.GameManager.lobbyShow();
    }
});
