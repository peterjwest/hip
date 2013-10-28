var BoardGameUI = function() {
	var that = this
	var game
	var playerTypes
	var colors
	var listeners
	var canvas
	var board
	var gameRound
	var canvasSize = 300
	var tokenSpacing

	this.init = function(gameArg, playerTypesArg, colorsArg, listenersArg) {
		game = gameArg
		playerTypes = playerTypesArg
		colors = colorsArg
		listeners = listenersArg
		this.makePlayerInputs()
		canvas = Raphael(game.find(".board")[0], canvasSize, canvasSize)
		game.find(".new").click(function() { listeners.newGame() })
		listeners.newGame(game.find(".boardSize").val())
	}

	this.newGame = function() {
		var boardSize = game.find(".boardSize").val()
		board = new Board(boardSize, boardSize)
		game.find(".boardSize").val(board.width)
		tokenSpacing = canvasSize / board.width
		that.drawGameBoard()
		gameRound = 1
		return {players : that.getPlayers(), board : board}
	}

	this.makePlayerInputs = function() {
		for (var i = playerTypes.length - 1; i >= 0; i--) {
			var input = game.find(".playerInput.hidden").clone().removeClass("hidden")
			input.find("label").text(playerTypes[i].name)
			input.find("input").addClass(playerTypes[i].className).attr("value", i === 2 ? 0 : 1)
			game.find("fieldset").prepend(input)
		}
	}

	this.getPlayers = function() {
		var players = []
		var number
		for (var i = 0; i < playerTypes.length; i++) {
			playerTypes[i].count = 0
			number = game.find("."+playerTypes[i].className).val()
			for (var j = 0; j < number; j++) {
				if (players.length >= colors.length) break
				players.push(playerTypes[i].create(colors[players.length]))
			}
			game.find("."+playerTypes[i].className).val(playerTypes[i].count)
		}
		while (players.length < 2) {
			players.push(playerTypes[0].create(colors[players.length]))
			game.find("."+playerTypes[0].className).val(parseInt(game.find("."+playerTypes[0].className).val()) + 1)
		}
		return players
	}


	this.makeMove = function(point, player, nextPlayer) {
		this.drawCircle(point, player.color)
		gameRound++
		this.updateInfo(nextPlayer)
	}

	this.setActivePlayer = function(player) {
		that.activePlayer = player
		that.updateInfo(player)
	}

	this.updateInfo = function(player) {
		game.find(".info").html("Round "+gameRound+": "+player.name+"'s move")
	}

	this.drawGameBoard = function() {
		canvas.clear()
		var tokens = board.allTokens()
		for (var i = 0; i < tokens.length; i++) {
			this.drawCircle(tokens[i], '#fff')
		}
	}

	this.drawEndBoard = function() {
		var tokens = board.allTokens()
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i].value === null) {
				this.drawCircle(tokens[i], '#efefff')
			}
		}
	}

	this.drawCircle = function(point, color) {
		var self = function(thing) { return thing }
		var c = canvas.circle(this.getPosition(point.x), this.getPosition(point.y), tokenSpacing / 2 * 0.9)
		c.attr({ fill: color })
		c.click(function() { listeners.makeMove(point, that.activePlayer) })
	}

	this.endGame = function(isADraw, player, losingSquares) {
		if (isADraw) var str = "A Draw!!!"
		else var str = player.name+" has lost!"
		game.find(".info").text(str)
		this.drawEndBoard()
		for (var i = 0; i < losingSquares.length; i++) {
			this.drawSquare(losingSquares[i])
		}
	}

	this.drawSquare = function(squ) {
		var points = []
		for (var i = 0; i < squ.length; i++) {
			points.push(this.getPosition(squ[i].x) + " " + this.getPosition(squ[i].y)) }
		var linePath = "M "+points[0]+" L "+points[1]+" L "+points[2]+" L "+points[3]+" Z"
		canvas.path(linePath)
	}

	this.getPosition = function(index) {
		return (tokenSpacing / 2) + (index * tokenSpacing)
	}
}

$(document).ready(function () {
	var engine = new HipEngine
	var ui = new BoardGameUI
	var colors = [
		'#EC244C',
		'#00FF4F',
		'#1E90FF',
		'#3854FD',
		'#652AAB',
		'#C00080'
	]
	var playerTypes = [
		new HumanPlayer(ui.setActivePlayer),
		new SimpleAI(engine),
		new RandomAI(engine)
	]
	engine.init(ui)
	ui.init($(".game"), playerTypes, colors, engine)
})
