cc.Class({
    extends: cc.Component,

    properties: {
        commonNode: {
            default: null,
            type: cc.Node
        },

        UserName: {
            default: null,
            type: cc.Label
        },

        UserUid: {
            default: null,
            type: cc.Label
        },
        
        HeadIcon: cc.Sprite
    },

    init: function() {
        this.commonNode.active = false;
        //clientEvent.on(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
    },

    setData: function(data) {
        this.commonNode.active = true;
        this.UserName.string = data.name;
        this.UserUid.string = data.uid;
    },

    onDestroy() {
    },
});
