ActiveGames =  require('../lib/active-games.js');

activeGames = new ActiveGames();

activeGames.create('First Game');
activeGames.create('Second Game');

var Games = function() {
}

Games.list = function(req, res) {

	var games = activeGames.getAll();
	console.log(games);
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
		game = activeGames.create(name, playerCount);
		console.log('Creating game ' + name + '[' + game.id +'] with up to ' + game.playerCount.toString() + ' users.');
		res.redirect('/games/' + game.id.toString());
	}
};

Games.get = function(req, res) {
	if (req && req.params && req.params.id) {
		var game = activeGames.get(req.params.id);
		res.render('game', {game: game});
	}
};

Games.join = function(req, res) {
	console.log(req);
};

module.exports = Games;
