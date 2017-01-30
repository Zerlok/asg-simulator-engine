"use strict"

const cfg = require('../core/config').engine;
const maxRounds = cfg.battle.maxRounds;

var UnitsIO = require('../units/io');
var Nodes = require('../nodes/base');
Nodes.io = require('../nodes/io');


function swap(a, b) {
	tmp = a;
	a = b;
	b = a;
}


class Player {
	constructor(name, units, nodes) {
		this.name = name;
		this.units = {initial: UnitsIO.fromJson(units), current: []};
		this.strategy = Nodes.io.fromJson(nodes);
		// this.state = cfg.battle.defaultState;
	}

	isReady() {
		return (this.units.current.length > 0);
	}

	findRoot() {
		var rootNode = null;
		for (var i in this.strategy) {
			var node = this.strategy[i];
			if (node.name == cfg.nodes.main) {
				rootNode = node;
				break;
			}
		}

		if (rootNode == null)
			return console.error(`Root node was not found in ${this.name} player strategy!`);

		rootNode.id = 0;
		return rootNode;
	}

	validate() {
		if (this.units.length == 0) {
			console.error(`'${this.name}' player has not any unit!`);
			return false;
		}

		var rootNode = this.findRoot();
		if (rootNode == null) {
			console.error(`'${this.name}' player strategy doesn't has main node!`);
			return false;
		}

		this.strategy = Nodes.getTHL(rootNode); // TODO: Save nodes as linear array.
		return true;
	}

	updateState() {
		var lst = []
		for (var i in this.units.current) {
			var unit = this.units.current[i];
			if (unit.isAlive())
				lst.push(unit);
		}

		if (lst.length == 0)
			this.state = Nodes.config.battle.states[2];

		this.units.current = lst;
	}
}


function simulateBattle(attacker, defender) {
	if (!attacker.validate()) {
		return console.error(`Attacker '${attacker.name}' is invalid! Exiting battle simulation ...`);
	} else if (!defender.validate()) {
		return console.error(`Defender '${defender.name}' is invalid! Exiting battle simulation ...`);
	}

	var active = attacker;
	var inactive = defender;

	for (var i = 0; i < maxRounds; ++i) {
		active.updateState();
		if (active.isReady())
			break;

		var levels = active.strategy;
		var rootNode = levels[0][0];
		rootNode.setData(active.units.current, inactive.units.current, i/2, active.state);

		for (var l in levels) {
			var level = levels[l];
			for (var i in level) {
				var node = level[i];
				if (node.isReady()) {
					node.execute(); // TODO: Save node execution results into special BattleLogger.
				}
			}
		}

		// Change players (attacker and defender) for next round step.
		swap(active, inactive);
	}

	console.log(`Battle simulation (${attacker.name} vs ${defender.name}) was finished.`);
	console.log(`Attacker: units(${attacker.units.current.length})`);
	console.log(`Defender: units(${defender.units.current.length})`);
	// TODO: Create battle log file and save it.
}


module.exports = {
	Player: Player,
	simulateBattle: simulateBattle,
	config: cfg
};
