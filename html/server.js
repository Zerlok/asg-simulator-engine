/*
Used modules: express, body-parser, cookie-parser, multer (https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm).
*/

var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
// var spawnChild = require('child_process').spawn;

var Funcs = require('../engine/common/functions');
var config = require('../engine/config');
var Battle = require('../engine/battle');
var Nodes = require('../engine/nodes');
var Units = require('../engine/units');


var app = express();
app.use("/static/css", express.static("html/css"));
app.use("/static/js", express.static("html/js"));
app.use("/static/libs", express.static("libs"));
app.use("/public", express.static("html/public"));

var urlParser = bodyParser.urlencoded({ extended: false });
var ed = new Nodes.Editor();


app.get('/', function (request, response) {
	response.end(config.app.fullname + " is working.");
});


app.get('/nodes/config', function(request, response) {
	response.setHeader('Content-Type', 'application/json');
	response.end(JSON.stringify(config.engine.nodes));
});


app.get('/nodes/editor', function(request, response) {
	response.sendFile(__dirname+"/nodes-editor.html");
});


app.get('/nodes/save', function(request, response) {
	var name = request.params['name'];
	if (name == null) {
		response.end(JSON.stringify({result: "failure"}));
		return;
	}

	var path = name.split("/");
	name = path[path.length-1];
	fs.writeFile("/public/"+name, request.params['data'], function(err) {
		if (err) return console.error(`Caught an error: ${err} while writing into '/public/${name}' file!`);
	});

	console.log(`Nodes were written into '/public/${name}' successfuly.`);
	response.end(JSON.stringify({result: "success"}));
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


app.get('/battle', function(request, response) {
	var attUnits = Units.builder.total(Funcs.rand(256, 512));
	var defUnits = Units.builder.total(Funcs.rand(256, 512));
	var attNodes = ed.load("./public/attacker.json");
	var defNodes = ed.load("./public/defender.json");

	var attacker = new Battle.Player("Foo", attUnits, attNodes);
	var defender = new Battle.Player("Bar", defUnits, defNodes);

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
