var Point = function(x,y) {
	this.x = x
	this.y = y
}

var Board = function(width, height) {
	var min = 3
	var max = 20
	this.height = (height > max) ? max : (height < min ? min : height)
	this.width = (width > max) ? max : (width < min ? min : width)
	var tokens = []
	
	for (var y = 0; y < this.height; y++) {
		tokens[y] = []
		for (var x = 0; x < this.width; x++) {
			tokens[y][x] = null
		}
	}
	
	this.allTokens = function() {
		tokenList = []
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				token = new Point(x,y)
				token.value = tokens[y][x]
				tokenList.push(token)
			}
		}
		return tokenList
	}
	
	this.getToken = function(x, y) {
		return tokens[y][x] }
	
	this.setToken = function(x, y, val) {
		return tokens[y][x] = val }
		
	this.outOfBounds = function(point) {
		if (point.x < 0 || point.x >= this.width) return true 
		if (point.y < 0 || point.y >= this.height) return true 
		return false 
	}
}

var HipEngine = function(callbacks) {
	var that = this
	var players
	var currPlayer
	var callbacks
	
	var getCurrPlayer = function() {
		return players[currPlayer]
	}
	
	var getNextPlayer = function() {
		return (currPlayer + 1) % players.length
	}
	
	this.init = function(callbacksArg) {
		callbacks = callbacksArg
	}
	
	//players should be an array of Player object
	this.newGame = function() {
		this.losingSquares = false
		this.gameEnded = false
		var settings = callbacks.newGame()
		this.board = settings.board
		players = settings.players
		for (var i = 0; i < players.length; i++) { players[i].index = i }
		currPlayer = 0
		players[currPlayer].turnNotify(currPlayer)
	}
	
	//makes a move; point should be a Point object, player should be player index from player array
	this.makeMove = function(point, player) {
		if (this.gameEnded) return false
		if (currPlayer !== player.index) return false
		if (this.board.getToken(point.x, point.y)) return false
		this.board.setToken(point.x, point.y, player)
		callbacks.makeMove(point, getCurrPlayer(), players[getNextPlayer()])
		var losingSquares = this.moveEndsGame(point, player)
		if (this.boardComplete() || losingSquares.length > 0) {
			this.gameEnded = true
			callbacks.endGame(losingSquares.length === 0, getCurrPlayer(), losingSquares)
			return true
		}
		currPlayer = getNextPlayer()
		getCurrPlayer().turnNotify(currPlayer)
		return true
	}
	
	//checks if all pieces have been placed
	this.boardComplete = function() {
		for (var y = 0; y < this.board.height; y++) {
			for (var x = 0; x < this.board.width; x++) {
				if (this.board.getToken(x,y) === null) return false
			}
		}
		return true
	}
	
	//checks if a move will end the game (does not make the move)
	this.moveEndsGame = function(point, player) {
		var squares = this.getSquares(point)
		var losingSquares = []
		var playerHasSquare
		for (var i = 0; i < squares.length; i++) {
			playerHasSquare = true
			for (var j = 1; j <= 3; j++) {
				if (this.board.getToken(squares[i][j].x, squares[i][j].y) != player) {
					playerHasSquare = false
					break
				}
			}
			if (playerHasSquare) losingSquares.push(squares[i])
		}
		return losingSquares
	}
	
	//gets all squares which can be formed by point
	this.getSquares = function(point) {
		var squares = []
		var square
		for (var x = 0; x < this.board.width; x++) {
			for (var y = 0; y < this.board.height; y++) {
				if (point.x == x && point.y == y) continue
				if (square = this.getSquare(point, new Point(x,y)))
					squares.push(square)
			}
		}
		return squares
	}
	
	//gets the square formed by point1, point2 etc. in a clockwise direction
	this.getSquare = function(point1, point2) {
		if (this.board.outOfBounds(point1)) return false
		point1.dx = point2.x - point1.x
		point1.dy = point2.y - point1.y 
		points = [point1]
		for (var i = 1; i < 4; i++) {
			points[i] = this.nextPointClockwise(points[i-1])
			if (this.board.outOfBounds(points[i])) return false
		}
		return points 
	}
	
	this.nextPointClockwise = function(point) {
		return { x : point.x + point.dx, y : point.y + point.dy, dx : point.dy, dy : -point.dx } 
	}
}