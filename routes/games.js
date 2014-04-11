'use strict';

var Game = require('../lib/game.js');
var Player = require('../lib/player.js');

var activeGames = [];

Game.getAllIds(function(games) {
	games.forEach(function(id) {
		Game.load(id, function(err, game) {
			if (err) return err;
			activeGames.push(game);
		});
	});
});

var Games = function() {
	this.name = '';
};

Games.list = function(req, res) {
	res.render('active-games', {title: "Active Games",
								games: activeGames});
};

Games.new = function(req, res) {
	res.render('new-game', {title: "New Game"});
};

Games.create = function(req, res) {
	var name, playerCount, game;

	console.log(req.body.game);
	if (req && req.body && req.body.game && req.body.game.name) {
		console.log('Games:create');
		name = req.body.game.name;
		playerCount = req.body.game.playerCount;
		game = new Game({
			name: name,
			playerCount: playerCount
		});
		game.save(function(err) {
			console.log('Saved!');
			if (err) throw err;
			console.log('Creating game ' + name + '[' + game.id +'] with up to ' + game.playerCount.toString() + ' users.');
			console.log('redirect: /games/' + game.id.toString());
			console.log(res);
			activeGames.push(game);
			res.redirect('/games/' + game.id.toString());
		});
		
	}
};

Games.get = function(req, res) {
	var i, id;
	console.log('Games:get')
	if (req && req.params && req.params.id) {
		Player.load(req.session.sessionId, function(err, player) {
			id = Number(req.params.id);
			Game.load(id, function(err, game) {
				if (err) throw err;
				console.log(game);
				res.render('game', {game: game, player:player});
			});
		});
	}
};

Games.join = function(req, res) {
	var id, game;

	if (req && req.params && req.params.id) {
		Player.load(req.session.sessionId, function(err, player) {
			if (err) throw err;
			id = Number(req.params.id);
			Game.load(id, function(err, game) {
				game.join(player);
				res.redirect('/games/' + game.id);
			});
		});	
	}
};

Games.connect = function(socket, data) {
	console.log(data);
	if (data && data.playerId && data.gameId) {
		Player.load(data.playerId, function(err, player) {
			if (err) throw err;
			Game.load(data.gameId, function(err, game) {
				if (err) throw err;
				socket.join(game.id);
				player.socket = socket;
				console.log('broadcasting to game ' + game.id);
				socket.broadcast.to(game.id).emit('message', {text: "Player " + player.name + " has joined the game" });
			});
		});
	}
};

module.exports = Games;
