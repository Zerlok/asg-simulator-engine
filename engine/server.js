/*
Used modules: express, body-parser, cookie-parser, multer (https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm).
*/

var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var spawnChild = require('child_process').spawn;

var Funcs = require('./common/functions');
var config = require('./config');
var Battle = require('./battle');
var Nodes = require('./nodes');
var Units = require('./units');


var app = express();
app.use("/static", express.static("strategies"));
app.use("/static/plumb", express.static("jsPlumb"));
var urlParser = bodyParser.urlencoded({ extended: false });
var ed = new Nodes.Editor();


app.get('/', function (request, response) {
	response.end(config.app.fullname + " is working.");
});


// app.get('/child', function(request, response) {
// 	var child = spawnChild("node", ["./engine/battle/run.js", "myarg1", "myarg2"]);
//
// 	var battleResult;
// 	child.stdout.on("data", (data) => {
// 		// console.log(`result data: """${data}"""`);
// 		battleResult = data;
// 	});
//
// 	child.stderr.on('data', (data) => {
// 		console.log(`listener stderr: ${data}`);
// 	});
//
// 	child.on('close', (code) => {
// 		response.setHeader('Content-Type', 'application/json');
// 		response.end(JSON.stringify(battleResult));
// 	});
// });


app.get('/test/strategy', function(request, response) {
	// const filename = "./strategies/tmp.txt";
	// var text = fs.readFileSync(filename, 'utf8', function(err, d) {
	// 	if (err) return console.error(`Caught an error: ${err} while reading '${filename}' file!`);
	// });
	//
	// response.setHeader('Content-Type', 'application/json');
	// response.end(text);

	response.sendFile(__dirname+"/html/strat_editor.html");
});


app.get('/test/battle', function(request, response) {
	var attUnits = Units.builder.total(Funcs.rand(256, 512));
	var defUnits = Units.builder.total(Funcs.rand(256, 512));
	var attNodes = ed.load("./strategies/tmp.txt");
	var defNodes = ed.load("./strategies/tmp.txt");

	var attacker = new Battle.Player("PlayerA", attUnits, attNodes);
	var defender = new Battle.Player("PlayerB", defUnits, defNodes);

	logger.log(`Attacker: units(${attacker.units.current.length}) ==> ${attacker.score}`);
	logger.log(`Defender: units(${defender.units.current.length}) ==> ${defender.score}`);

	Battle.simulate(attacker, defender);

	logger.log(`Battle simulation (${attacker.name} vs ${defender.name}) was finished.`);
	logger.log(`Attacker: units(${attacker.units.current.length}) ==> ${attacker.score}`);
	logger.log(`Defender: units(${defender.units.current.length}) ==> ${defender.score}`);

	response.setHeader('Content-Type', 'application/json');
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
