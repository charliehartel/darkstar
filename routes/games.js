//ActiveGames =  require('../lib/active-games.js');
var Game = require('../lib/game.js');
var Player = require('../lib/player.js');

var activeGames = [ Game.create('FirstGame', 8),
					Game.create('Second Game', 12)
				  ];

var Games = function() {
}

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

	if (req && req.body && req.body.game && req.body.game.name) {
		name = req.body.game.name;
		playerCount = req.body.game.playerCount;
		game = Game.create(name, playerCount);
		activeGames.push(game);
		console.log('Creating game ' + name + '[' + game.id +'] with up to ' + game.playerCount.toString() + ' users.');
		res.redirect('/games/' + game.id.toString());
	}
};

Games.get = function(req, res) {
	var i;
	if (req && req.params && req.params.id) {
		for (i = 0; i < activeGames.length; i++) {
			if (activeGames[i].id === req.params.id) {
				res.render('game', {game: activeGames[i]});
			}
		}
	}
};

var joinGame = function(req, res, player) {
	if (req && req.params && req.params.id) {
		for (i = 0; i < activeGames.length; i++) {
			if (activeGames[i].id === req.params.id) {
				activeGames[i].join(player);
				res.redirect('/games/' + req.params.id);
			}
		}
	}
}

Games.join = function(req, res) {
	var i, player;
	if (req.session.id) {
		console.log("Loading player " + req.session.id);
		Player.load(req.session.id, function(err, player) {
			console.log(player.name + " joinging game " + game.name);
			joinGame(req, res, player);
		});
	}
	/*
	else {
		player = new Player();
		player.save(function(err) {
			if (err) throw err;
			joinGame(player);
		});
	}*/
};

module.exports = Games;
