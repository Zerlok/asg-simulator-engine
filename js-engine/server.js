/*
Used modules: express, body-parser, cookie-parser, multer (https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm).
*/

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var simulator = require('./battle/simulator');


const config = {
	host: 'localhost',
	port: 8000,
	appname: simulator.config.appname,
	app: simulator.config.shortname
};
var app = express();
var urlParser = bodyParser.urlencoded({ extended: false });


app.get('/', function (request, response) {
	response.end(config.appname + " is working.");
});

app.get('/battle', function(request, response) {
	var q = request.query;
	var attacker = new simulator.Player(q.attackerName, q.attackerUnits, q.attackerNodes);
	var defender = new simulator.Player(q.defenderName, q.defenderUnits, q.defenderNodes);

	var result = simulator.simulateBattle(attacker, defender);

	response.end(result);
});


var server = app.listen(config.port, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log("Example app listening at http://%s:%s", host, port);
})


console.log(`Running simulator server on ${config.host}:${config.port} ...`);
