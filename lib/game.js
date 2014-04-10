var redis = require('redis');
var db = redis.createClient(6379, '127.0.0.1');

db.on('error', function (err) {
    console.log('Error ' + err);
});

var Game = function() {
	this.players = [];
	this.round = 0;
	this.playerCount = 0;
};

Game.create = function(name, playerCount) {
	var game = new Game();
	game.name = name;
	game.playerCount = playerCount;
	game.save(function(err) {
		if (err) throw err;
	});

	return game;
};

Game.prototype.update = function(fn) {
	var game = this;
	var id = game.id;
  	db.set('game:id:' + game.name, id, function(err) {
   	if (err) return fn(err);
	db.hmset('game:' + id, game, function(err) {
		fn(err); });
	}); 
 };


Game.prototype.save = function(fn) {
	if (this.id) { 
		this.update(fn);
	} else {
		var game = this;
		db.incr('game:ids', function(err, id) {
  			if (err) return fn(err);
  			game.id = id;
    		game.update(fn);
  		});
	}
};

Game.prototype.join = function(player) {
	this.players.push(player);
	this.save(function(err) {
		if (err) throw err;
	})
};

module.exports = Game;