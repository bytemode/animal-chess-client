cc.Class({
    extends: cc.Component,

    properties: {
        playerSprite: {
            default: null,
            type: cc.Sprite
        }
    },

    onLoad: function(){
        clientEvent.on(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
    },

    setData: function(userInfo) {
        this.userInfo = userInfo;
        this.playerId = userInfo.uid
        this.playerSprite.node.active = true;

        //请求用户头像
    },

    userInfoSet: function(recvMsg) {
        if (recvMsg.account == this.playerId) {
            if (recvMsg.headIcon && recvMsg.headIcon !== "-") {
                cc.loader.load({url: recvMsg.headIcon, type: 'png'}, function(err, texture) {
                    var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                    if(this.playerSprite) {
                        this.playerSprite.spriteFrame = spriteFrame;
                    }
                }.bind(this));
            }
        }
    },

    onDestroy() {
        clientEvent.off(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
    }
});
