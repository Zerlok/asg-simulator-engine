"use strict"

var fs = require('fs');
var Units = require('../units');
var Nodes = require('../nodes');
var cfg = require('../config').engine;


class Logger {
	constructor() {
		this.rows = [];
	}

	save(filename) {
		// var text;
		fs.writeFile(filename, this.rows.join("\n"), function(err) {
			if (err) return console.error(`Caught an error: ${err} while writing into '${filename}' file!`);
		});
		return true;
	}

	load(filename) {
		var text = fs.readFileSync(filename, 'utf8', function(err, d) {
			if (err) return console.error(`Caught an error: ${err} while reading '${filename}' file!`);
		});
		this.rows = text.split("\n");
		return true;
	}

	clear() {
		this.rows = [];
	}

	now() {
		var d = new Date(Date.now());
		return d.toISOString();
	}

	logRound(num, player) {
		// this.rows.push({
		// 	level: "info",
		// 	name: `round-${num}-${player.name}`,
		// 	params: {}
		// });
		this.rows.push(`[INFO] [round-${num}-${player.name}]`);
	}

	logNodeExec(node) {
		// this.rows.push({
		// 	level: "debug",
		// 	name: `node-exec-${node.name}-${node.id}`,
		// 	params: {
		// 		inputs: node.getValues(),
		// 		outputs: node.getResults()
		// 	}
		// });
		var params = {
			inputs: node.getValues(),
			outputs: node.getResults()
		};
		this.rows.push(`[DEBUG] [exec-${node.name}-${node.id}] : ${JSON.stringify(params)}`);
	}

	logShipCmd(node) {
		// this.rows.push({
		// 	level: "info",
		// 	name: `ship-cmd-${name}`,
		// 	params: {
		// 		own: Units.io.toJson(own),
		// 		enemies: Units.io.toJson(enemies)
		// 	}
		// });
		var units = node.getValues()[0];
		var self =	units[cfg.units.self];
		var enemy = units[cfg.units.enemy];
		this.rows.push(`[INFO] [order-${node.name}] : ${Units.io.toJson(self)} ${Units.io.toJson(enemy)}`);
	}
}


module.exports = Logger;
