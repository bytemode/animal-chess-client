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

    getIndex:function(x, y){
        return i * 4 + j
    },

    initFaPai: function(data) {
        for ( var i = 0; i < 4; i++) { 
            for ( var j = 0; j < 4; j++) {
                var index = i * 4 + j
                this.chess[i][j] = data.pieces[index]; 
            }
        }
        this.pieces = data.pieces
        this.camps  = data.camps
    },

    getPieces: function(){
        return this.pieces
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
};

module.exports = Logic;