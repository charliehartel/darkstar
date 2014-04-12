'use strict';

var redis = require('redis');
var db = redis.createClient(6379, '127.0.0.1');

db.on('error', function (err) {
    console.log('Error ' + err);
});

module.exports = db;