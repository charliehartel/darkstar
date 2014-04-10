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


Game.prototype.update = function(fn) {
	var game = this;
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
  			game.id = id;
    		game.update(fn);
  		});
	}
};

Game.prototype.join = function(player) {
	console.log('Game.join');
	this.players.push(player);
	this.save(function(err) {
		if (err) throw err;
	});
};

module.exports = Game;