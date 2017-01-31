/*
Used modules: express, body-parser, cookie-parser, multer (https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm).
*/

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

var Funcs = require('./common/functions');
var config = require('./config');
var Battle = require('./battle');
var Nodes = require('./nodes');
var Units = require('./units');


var app = express();
var urlParser = bodyParser.urlencoded({ extended: false });
var ed = new Nodes.Editor();


app.get('/', function (request, response) {
	response.end(config.app.fullname + " is working.");
});


app.get('/battle/test', function(request, response) {
	var attUnits = Units.builder.total(Funcs.rand(256, 512));
	var defUnits = Units.builder.total(Funcs.rand(256, 512));

	var attNodes = ed.load("./strategies/tmp.txt");
	var defNodes = ed.load("./strategies/tmp.txt");

	var attacker = new Battle.Player("PlayerA", attUnits, attNodes);
	var defender = new Battle.Player("PlayerB", defUnits, defNodes);

	console.log(`Attacker: units(${attacker.units.current.length}) ==> ${attacker.score}`);
	console.log(`Defender: units(${defender.units.current.length}) ==> ${defender.score}`);

	Battle.simulate(attacker, defender);

	console.log(`Battle simulation (${attacker.name} vs ${defender.name}) was finished.`);
	console.log(`Attacker: units(${attacker.units.current.length}) ==> ${attacker.score}`);
	console.log(`Defender: units(${defender.units.current.length}) ==> ${defender.score}`);

	response.end(JSON.stringify({
		attacker: {
			name: attacker.name,
			score: attacker.score,
			ships: {
				left: attacker.units.current.length,
				lost: attacker.units.initial.length - attacker.units.current.length
			}
		},
		defender: {
			name: defender.name,
			score: defender.score,
			ships: {
				left: defender.units.current.length,
				lost: defender.units.initial.length - defender.units.current.length
			}
		}
	}));
});


var server = app.listen(config.app.port, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log(`Example app listening at http://${host}:${port}`);
})


console.log(`Running Simulator server on ${config.app.host}:${config.app.port} ...`);
