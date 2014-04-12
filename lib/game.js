'use strict';

var db = require('./db');
var List = require('./list');
var Player = require('./player');

var Game = function(obj) {
	for (var key in obj) {
    	this[key] = obj[key];
    }

    this.list = new List('players', this.id);
};

Game.load = function(id, fn) {
	db.hgetall('game:' + id, function(err, value) {
		var game;
		if (err) throw err;
		game = new Game(value);
		game.players = [];
		game.list.getAll(Player.load, function(list) {
			if (list) {
				game.players = list;
			} 
			fn(err, game);
		});
		
	});
};

Game.prototype.update = function(fn) {
	var game = {};
	game.name = this.name;
	game.id = this.id;
	game.playerCount = this.playerCount;

	var id = game.id;
  	db.hmset('game:' + id, game, function(err) {
   		fn(err);
	}); 
 };


Game.prototype.save = function(fn) {

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

Game.prototype.join = function(player, fn) {
	this.list.add(player.id, fn);
};

module.exports = Game;