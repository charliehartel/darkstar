'use strict';

var Game = require('../lib/game.js');
var Player = require('../lib/player.js');
var List = require('../lib/list.js');


var activeGames = new List("games", "active");

var loadGame = function(id, fn) {
	Game.load(id, function(err, game) {
		if (err) throw err;
		if (game) {
			console.log('Game ' + game.id + ' loaded.');
		} else {
			console.log('Cannot find game ' + id);
		}
		
		fn(game);
	});
};

var loadPlayer = function(id, fn) {
	Player.load(id, function(err, player) {
		if (err) throw err;
		if (player) {
			console.log('Player ' + player.id + ' loaded.');
		} else {
			console.log('Cannot find player ' + id);
		}
		fn(player);
	});
};

var send404 = function(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
  	response.write('Error 404: resource not found.');
  	response.end();

};

var loadGameAndPlayer = function(req, res, fn) {
	if (req && req.params && req.params.id) {
		loadGame(Number(req.params.id), function(game) {
			if (game) {
				loadPlayer(req.session.sessionId, function(player) {
					fn({game:game, player:player});
				});
			} else {
				send404(res);
			}
		});
	}
};

var Games = function() {
	this.name = '';
};

Games.list = function(req, res) {
	activeGames.getAll(Game.load, function(activeGames) {
		res.render('active-games', {title: "Active Games",
								games: activeGames});
	});
	
};

Games.new = function(req, res) {
	res.render('new-game', {title: "New Game"});
};

Games.create = function(req, res) {
	var name, playerCount, game;

	if (req && req.body && req.body.game && req.body.game.name) {
		name = req.body.game.name;
		playerCount = req.body.game.playerCount;
		game = new Game({
			name: name,
			playerCount: playerCount
		});
		game.save(function(err) {
			if (err) throw err;
			activeGames.add(game.id, function(err) {
				res.redirect('/games/' + game.id.toString());
			});
			
		});
		
	}
};



Games.get = function(req, res) {
	loadGameAndPlayer(req, res, function(data) {
		var template = '';
		if (!data.game.isStarted()) {
			template = './game/active-game';
		} else if (data.game.isFinished()) {
			template = './game/finished-game';
		} else {
			template = './game/pre-game';
		}

		res.render(template, {game: data.game, player:data.player, players: data.game.players});
	});
};

Games.join = function(req, res) {
	loadGameAndPlayer(req, res, function(data) {
		data.game.join(data.player, function(err) {
			if (!err) res.redirect('/games/' + data.game.id);
			else res.render('error');
		});
	});
};

Games.connect = function(socket, data) {
	if (data && data.playerId && data.gameId) {
		Player.load(data.playerId, function(err, player) {
			if (err) throw err;
			Game.load(data.gameId, function(err, game) {
				if (err) throw err;
				socket.join(game.id);
				player.socket = socket;
				socket.broadcast.to(game.id).emit('message', {text: "Player " + player.name + " has joined the game" });
			});
		});
	}
};

Games.start = function(req, res) {
	loadGameAndPlayer(req, res, function(data) {
		data.game.start(function(err) {
			if (!err) {
				io.sockets.in(data.game.id).emit('refresh', {});
			} 
			else {
				res.render('error');
			}
		});
	});

};

module.exports = Games;
