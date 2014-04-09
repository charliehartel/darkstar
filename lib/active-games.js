function ActiveGames() {
	this.games = [];
};

ActiveGames.prototype.getAll = function () {
	return this.games;
}

var id = 0;
ActiveGames.prototype.create = function(name, playerCount) {
	var game = {};
	game.name = name;
	game.playerCount = playerCount;
	game.id = id;

	this.games.push(game); 
	id += 1;
	return game;
}

ActiveGames.prototype.get = function(id) {
	return this.games[id];
}

module.exports = ActiveGames;