'use strict';

var redis = require('redis');
var db = redis.createClient(6379, '127.0.0.1');

db.on('error', function (err) {
    console.log('Error ' + err);
});

var Game = function(obj) {
	for (var key in obj) {
    	this[key] = obj[key];
    }

    if (!this.players) {
    	this.players = [];
    }
};

Game.load = function(id, fn) {
	console.log('Game:load - Loading Game ' + id);
	db.hgetall('game:' + id, function(err, value) {
		if (err) throw err;
		fn(err, new Game(value));
	});
};

Game.getAllIds = function(fn) {
	var games = [];
	console.log('Game.loadAll');
	db.llen('gamelist', function(err, len) {
		db.lrange('gamelist', 0, len, function(err, games) {
			if (err) fn([]);
			fn(games);
		});
	});
};

Game.prototype.update = function(fn) {
	var game = {};
	game.name = this.name;
	game.id = this.id;
	game.playerCount = this.playerCount;
	
	var id = game.id;
	console.log('Game: update');
  	db.hmset('game:' + id, game, function(err) {
   		console.log(game);
   		fn(err);
	}); 
 };


Game.prototype.save = function(fn) {
	console.log('Game:save');
	if (this.id) { 
		this.update(fn);
	} else {
		var game = this;
		db.incr('game:ids', function(err, id) {
  			if (err) return fn(err);
  			
  			db.lpush('gamelist', id, function(err) {
  				if (err) return fn(err);

  				game.id = id;
    			game.update(fn);
  			});

  		});
	}
};

Game.prototype.join = function(player) {
	console.log('Game.join');
	console.log(this);
	this.players.push(player);
	this.save(function(err) {
		if (err) throw err;
	});
};

module.exports = Game;