"use strict"

var fs = require('fs');

var Funcs = require('../common/functions');
var config = require('../config');
var Units = require('../units');
var Nodes = require('../nodes');
var Battle = require('../battle');


const workingPath = "./children-logs/" + (new Date(Date.now())).toISOString().split(":").join("-");
const cout = fs.createWriteStream(workingPath+"-output.log");
const cerr = fs.createWriteStream(workingPath+"-errors.log");
const logger = new console.Console(cout, cerr);

logger.log("Child started.");
process.argv.forEach(function (val, index, array) {
	logger.log(`Argv: ${val}`);
});


var ed = new Nodes.Editor();
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


console.log(attacker.name);
// process.send("finished!");

logger.log("Child finished.");
