
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var games = require('./routes/games');
var http = require('http');
var path = require('path');
var dust = require('dustjs-linkedin');
var cons = require('consolidate');
var Player = require('./lib/player.js');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');
app.set('template_engine', 'dust');
app.engine('dust', cons.dust);
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(function(req, res, next) {
	if (!req.session.sessionId) {
		var player = new Player();
		player.save(function(err) {
			if (err) throw error;
			req.session.sessionId = player.id;
			console.log('Created Player ' + player.id.toString());
			next();
		});
	} else {
		next();
	}
	
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/games', games.list);
app.get('/games/new', games.new);
app.post('/games/create', games.create);
app.get('/games/:id?', games.get);
app.post('/games/:id?/join', games.join);
app.post('/games/:id?/start', games.start);


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
	socket.on('join', function (data) {
		if (data) {
			games.connect(socket, data);
		}
	});
});
