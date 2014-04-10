'use strict';

//ActiveGames =  require('../lib/active-games.js');
var Game = require('../lib/game.js');
var Player = require('../lib/player.js');

var activeGames = [];

var gameOne = new Game({name: 'FirstGame', playerCount: 8});
gameOne.save(function(err) {activeGames.push(gameOne);});

var gameTwo = new Game({name: 'Second Game', playerCount: 12});
gameTwo.save(function(err) {activeGames.push(gameTwo);});


var Games = function() {
	this.name = '';
};

Games.list = function(req, res) {
	var games = activeGames;
	res.render('active-games', {title: "Active Games",
								games: games});
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
			activeGames.push(game);
			console.log('Creating game ' + name + '[' + game.id +'] with up to ' + game.playerCount.toString() + ' users.');
			console.log('redirect: /games/' + game.id.toString());
			console.log(res);
			res.redirect('/games/' + game.id.toString());
		});
		
	}
};

Games.get = function(req, res) {
	var i, id;
	console.log('Games:get')
	if (req && req.params && req.params.id) {
		for (i = 0; i < activeGames.length; i++) {
			id = Number(req.params.id);
			if (activeGames[i].id === id) {
				res.render('game', {game: activeGames[i]});
			}
		}
	}
};

var joinGame = function(req, res, player) {
	


}

Games.join = function(req, res) {
	var i, id;

	if (req && req.params && req.params.id) {
		console.log("Loading player " + req.session.sessionId);
		Player.load(req.session.sessionId, function(err, player) {
			if (err) throw err;
			id = Number(req.params.id);
			for (i = 0; i < activeGames.length; i++) {
				if (activeGames[i].id === id) {
					activeGames[i].join(player);
					res.redirect('/games/' + id);
				}
			}
		});	
	}
};

module.exports = Games;
