'use strict';

var db = require('./db');
var Player = require('./player');


var List = function(type, id) {
	this.id = id;
	this.type = type;
}


List.prototype.add = function(id, fn) {
	db.lpush(this.type + ':' + this.id, id, fn);
};

List.prototype.remove = function(id, fn) {
	db.lrem(this.type + ':' + this.id, id, 0, fn);
};

List.prototype.getAll = function(load, fn) {
	var list = [];
	var type = this.type;
	var id = this.id;

	db.llen(type + ':' + id, function(err, len) {

		if (len === 0) fn([]);

		db.lrange(type + ':' + id, 0, len, function(err, data) {

			if (data) {
				data.forEach(function(element) {
					load(element, function(err, player) {
						list.push(player);
						len -= 1;

						if (len === 0) {
							fn(list);
						}
					});
				});	
			}
			else
			{
				fn([]);
			}	
		});
 	});
};

module.exports = List;