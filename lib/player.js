'use strict';

var db = require('./db');

var Player = function(obj) {
	for (var key in obj) {
    	this[key] = obj[key];
    }
};

Player.load = function(id, fn) {
	var player;

	db.hgetall('player:' + id, function(err, value) {
		if (err) throw err;
		fn(err, new Player(value));
	});
};

Player.prototype.update = function(fn) {
	var player = this;
	var id = player.id;
 
	db.hmset('player:' + id, player, function(err) {
		fn(err); 
	});
 };


Player.prototype.save = function(fn) {
	if (this.id) { 
		this.update(fn);
	} else {
		var player = this;
		db.incr('player:ids', function(err, id) {
  			if (err) return fn(err);
  			player.id = id;
  			player.name = 'Player ' + id.toString();
    		player.update(fn);
  		});
	}
};


module.exports = Player;