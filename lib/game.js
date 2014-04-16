'use strict';

var db = require('./db');
var List = require('./list');
var Player = require('./player');

var vocab = [ 'foo',
			  'bar',
			  'dog',
			  'horse',
			  'cat',
			  'cow',
			  'pig',
			  'pony',
			  'hamster',
			  'pizza',
			  'hamburger',
			  'poop'];

var phrases = [ { text: 'This is a phrase {1}.',
				  count: 1 },
				{ text: 'This is a phrase {1}.',
				  count: 1 },
				{ text: 'This is a phrase {1}.',
				  count: 1 },
				{ text: 'This is a phrase {1}.',
				  count: 1}
			  ]


var Game = function(obj) {
	for (var key in obj) {
    	this[key] = obj[key];
    }

    this.list = new List('players', this.id);
	this.round = 0;
	this.playerCards = {};
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

Game.prototype.isStarted = function() {
	return this.round? false : true;
};

Game.prototype.isFinished = function() {
	return this.round === -1 ? true : false;
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
	this.players.push(player);
	fn();
};

Game.prototype.start = function(fn) {
	if (!this.round) {
		this.round = 0;
		this.nextRound(fn);

	} else {
		fn('Error starting game.');
	}
};

Game.prototype.nextRound = function(fn) {
	if (this.round !== -1) {
		if (!this.round) this.round = 0;
		else this.round += 1;

		this.currentPlayer = this.players[(this.round) % this.players.length];
		this.currentPhrase = phrases[this.round % phrases.length];
	} else {
		return false;
	}
};


module.exports = Game;