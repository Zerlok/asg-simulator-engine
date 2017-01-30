/*
Used modules: express, body-parser, cookie-parser, multer (https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm).
*/

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var Cfg = require('./config');


const config = {
	host: 'localhost',
	port: 8000,
	appname: Cfg.engine.appname,
	app: Cfg.engine.shortname
};
var app = express();
var urlParser = bodyParser.urlencoded({ extended: false });


app.get('/', function (request, response) {
	response.end(config.appname + " is working.");
});

app.get('/battle', function(request, response) {
	var q = request.query;
	var attacker = new Battle.Player(q.attackerName, q.attackerUnits, q.attackerNodes);
	var defender = new Battle.Player(q.defenderName, q.defenderUnits, q.defenderNodes);

	var result = Battle.simulateBattle(attacker, defender);

	response.end(JSON.stringify(q));
});


var server = app.listen(config.port, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log("Example app listening at http://%s:%s", host, port);
})


console.log(`Running Simulator server on ${config.host}:${config.port} ...`);
