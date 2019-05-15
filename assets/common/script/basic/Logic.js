var Logic = {
    init: function () {
        console.log('Init Logic')

        this.pieces = [-1, -1, -1, -1,   -1, -1, -1, -1,  -1, -1, -1, -1,  -1, -1, -1, -1]

        this.chess = new Array();
        for ( var i = 0; i < 4; i++) { 
            this.chess[i] = new Array();
            for ( var j = 0; j < 4; j++) { 
                this.chess[i][j] = -1; 
            }
        }
    },

    setPlayerData: function(data){
        //[] pos  uid  name isReady sex  isExit headURL  score  ip
        this.playerInfo = data
    },

    getPlayerData: function(){
        return this.playerInfo
    },

    initFaPai: function(data) {
        console.log("initFaPai", data)
        this.pieces = data.pieces
        this.camps  = data.camps

        for ( var i = 0; i < 4; i++) { 
            for ( var j = 0; j < 4; j++) {
                var index = i * 4 + j
                this.chess[i][j] = data.pieces[index]; 
            }
        }
    },

    getPieces: function(){
        return this.pieces
    },

    getPieceByIndex: function(index) {
        return this.pieces[index];
    },

    getLeftPiece: function(index) {
        if(index % 4  == 0) {
            return -1
        }
        else
        {
            return index - 1
        }
    },

    getRightPiece: function(index) {
        if((index + 1)% 4  == 0) {
            return -1
        }
        else
        {
            return index + 1
        }
    },

    getTopPiece: function(index) {
        if(index - 4 > 0){
            return index - 4
        }else
        {
            return -1
        }
    },

    getBottomPiece: function(index){
        if(index  + 1 < 16){
            return index + 4
        }
        else{
            return -1
        }
    },

    isCanMove: function(src, dest) {
        if(this.getLeftPiece(src) == dest){
            return true
        }

        if(this.getRightPiece(src) == dest){
            return true
        }

        if(this.getTopPiece(src) == dest){
            return true
        }

        if(this.getBottomPiece(src) == dest){
            return true
        }

        return false
    },

    getMoveDir: function(index) {
        let ret = {"left": false,  "right":false, "up": false, "down":false}
        let left = this.getLeftPiece(index)
        if(left > -1 ){
            if(this.pieces[left] == 0 ||(this.pieces[left] > 0 && !this.isMyPiece(this.pieces[left])) ){
                ret.left = true
            }
        }

        let right = this.getRightPiece(index)
        if(right > -1 ){
            if(this.pieces[right] == 0 ||(this.pieces[right] > 0 && !this.isMyPiece(this.pieces[right])) ){
                ret.right = true
            }
        }

        let up = this.getTopPiece(index)
        if(up > -1 ){
            if(this.pieces[up] == 0 ||(this.pieces[up] > 0 && !this.isMyPiece(this.pieces[up])) ){
                ret.up = true
            }
        }

        let down = this.getBottomPiece(index)
        if(down > -1 ){
            if(this.pieces[down] == 0 ||(this.pieces[down] > 0 && !this.isMyPiece(this.pieces[down])) ){
                ret.down = true
            }
        }

        return ret
    },

    setPieceByIndex: function(index, value) {
        this.pieces[index] = value
    },

    getChess: function(){
        return this.chess
    },

    getCamps:function(){
        return this.camps
    },

    getCampById: function(id){
        for (var index = 0; index < this.camps.length; index++) {
            var element = this.camps[index]
            if(element.uid == id){
                return element.camp;
            }
        }
        return null
    },

    getPlayerInfoByID: function(id) {
        for (var index = 0; index < this.camps.length; index++) {
            var element = this.camps[index]
            if(element.uid == id){
                return element;// uid name headurl camp
            }
        }
        return null
    },

    getCampByType: function(type) {
        if(type < 9){
            return 1
        }
        return 2
    },

    setRoundIndo: function(data){
        this.roundInfo = data //uid  camp timestamp
        this.camp = data.camp
    },

    isMyPiece: function(type) {
        return this.getCampByType(type) == this.getCampById(Game.GameManager.uid) 
    },

    isMyRound: function() {
        if(this.camp){
            return this.camp == this.getCampById(Game.GameManager.uid)
        }
        return false
    },

    //移动棋子
    movePiece:function(src, dest) {
        this.pieces[dest] = this.pieces[src]
        this.pieces[src] = 0
    }
};

module.exports = Logic;