var Player = function() {
	this.name = "Player"
	this.className = "player"
	this.count = 0
	this.create = function(color) {
		this.count++
		return {
			name : this.name+" "+this.count,
			color : color,
			turnNotify : this.turnNotify 
		}
	}
	
	this.turnNotify = function() {
	}
}

var HumanPlayer = function(callback) {
	this.name = "Human Player"
	this.className = "humanPlayer"
	this.turnNotify = function() {
		callback(this)
	}
}
HumanPlayer.prototype = new Player

var RandomAI = function(engine) {
	this.name = "Random AI"
	this.className = "randomAI"
	this.turnNotify = function() {
		var x
		var y
		do {
			x = Math.floor(Math.random() * engine.board.width)
			y = Math.floor(Math.random() * engine.board.height)
		} while (!engine.makeMove(new Point(x,y), this))
	}
}
RandomAI.prototype = new Player

var SimpleAI = function(engine) {
	this.name = "Simple AI"
	this.className = "simpleAI"
	this.turnNotify = function() {
		var tokens = engine.board.allTokens().sort(function(){ return Math.random() - 0.5 })
		for (var i = 0; i < tokens.length; i++) {
			if (engine.moveEndsGame(tokens[i], this).length == 0) {
				if (engine.makeMove(tokens[i], this)) return
			}
		}
		for (i = 0; i < tokens.length; i++) {
			if (engine.makeMove(tokens[i], this)) return
		}
	}
}
SimpleAI.prototype = new Player