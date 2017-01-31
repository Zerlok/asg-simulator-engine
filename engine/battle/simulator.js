"use strict"

const cfg = require('../config').engine;
const maxRounds = cfg.battle.maxRounds;

var Units = require('../units');
var Nodes = require('../nodes');
var Logger = require('./logger');


class Player {
	constructor(name, units, nodes) {
		this.name = name;
		this.units = {initial: units, current: units.slice() };
		this.strategy = nodes;
		this.score = 0;
		for (var i = 0; i < units.length; ++ i)
			this.score += units[i].score;
		// this.units = { initial: Units.io.fromJson(units), current: [] };
		// this.strategy = Nodes.io.fromJson(nodes);
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
			return console.error(`Root node was not found in '${this.name}' player strategy!`);

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

		this.strategy = Nodes.base.buildLST(rootNode).data;
		return true;
	}

	updateState() {
		var lst = [];
		var unit;
		for (var i = 0; i < this.units.current.length; ++i) {
			unit = this.units.current[i];
			if (!unit.isAlive()) {
				this.score -= unit.score;
			} else {
				lst.push(unit);
			}
		}
		this.units.current = lst;
	}
}


function simulateBattle(attacker, defender) {
	if (!attacker.validate()) {
		return console.error(`Attacker '${attacker.name}' is invalid! Exiting battle simulation ...`);
	} else if (!defender.validate()) {
		return console.error(`Defender '${defender.name}' is invalid! Exiting battle simulation ...`);
	}

	var battle = new Logger();
	var active, inactive;
	var players = [attacker, defender];
	var idx = 0;

	var l, i, levels;
	var node, rootNode;

	battle.clear();

	// for (var round = 0; round < 2; ++i) {
	for (var round = 0; round < maxRounds; ++round) {
		active = players[(idx%2)];
		inactive = players[1 - (idx%2)];
		active.updateState();
		if (!active.isReady())
			break;

		levels = active.strategy;
		rootNode = levels[0][0];
		battle.logRound(round, active);
		rootNode.initData(active.units.current, inactive.units.current, round/2, active.state);

		for (l = 0; l < levels.length; ++l) {
			for (i = 0; i < levels[l].length; ++i) {
				node = levels[l][i];
				if (node.isReady()) {
					node.execute();
					battle.logNodeExec(node);
					node.refresh();
				}
			}
		}

		++idx;
	}

	battle.save("./logs/b"+battle.now());
}


module.exports = {
	Player: Player,
	simulateBattle: simulateBattle,
};
