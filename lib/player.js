var redis = require('redis');
var db = redis.createClient(6379, '127.0.0.1');

db.on('error', function (err) {
    console.log('Error ' + err);
});


var Player = function(obj) {
	for (var key in obj) {
    	this[key] = obj[key];
    }
};

Player.load = function(id, fn) {
	var player;

	console.log('Player:load - Loading Player ' + id);
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
    		console.log('Updating Player');
    		console.log(player);
  		});
	}
};


module.exports = Player;