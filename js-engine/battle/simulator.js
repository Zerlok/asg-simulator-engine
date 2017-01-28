"use strict"

var cfg = require('./config');
const maxRounds = Nodes.config.battle.maxRounds;


function swap(a, b) {
	tmp = a;
	a = b;
	b = a;
}


class Player {
	constructor(name, units, nodes) {
		this.name = name;
		this.units = {initial: units, current: units.slice()};
		this.strategy = nodes;
		this.state = Nodes.config.battle.defaultState;
	}

	get isReady() {
		return (this.state != Nodes.config.battlefield.states[0]);
	}

	findRoot() {
		var rootNode = null;
		for (var i in this.strategy) {
			var node = this.strategy[i];
			if (node.name == Nodes.config.nodes.firstNodeName) {
				rootNode = node;
				break;
			}
		}

		if (rootNode == null)
			return console.error(`Root node was not found in ${this.name} player strategy!`);

		rootNode.id = 0;
		return rootNode;
	}

	sortStrategy() {
		var rootNode = this.findRoot();
		var l = 0;
		var levels = [[rootNode]];

		// While have unfinished level (finished level means each node at last level hasn't got children nodes).
		while (l < levels.length) {
			// Looking through current level.
			for (var i in levels[l]) {
				var level = levels[l];
				var node = level[i];
				var children = node.children();

				// If node has children, then current level is not finished (is not last).
				if (children.length > 0) {
					if (l+1 == level.length) { // Add next level if required.
						level.push([]);
					}
					var nextLevel = level[l+1];

					// For each child of current node.
					for (var c in children) {
						var child = children[c];

						// Check if child is not at next level.
						if (nextLevel.indexOf(child) == -1) {
							nextLevel.push(child); // Save child at next level.
							for (var badL = l; badL >= 0; --badL) { // Check child and remove from earlier levels.
								var badIdx = levels[badL].indexOf(child);
								if (badIdx != -1)
									levels[l].splice(badIdx, 1);
							}

						} // endif new child node.
					} // endfor children.
				} // endif has children.
			} // endfor node in current level.
			++l;
		} // endwhile has unfinished level.

		this.strategy = levels; // TODO: Save nodes as linear array.
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
	attacker.sortStrategy();
	defender.sortStrategy();
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
	console.log(`Attacker: units(${attacker.units.current.length}), state: ${attacker.state}`);
	console.log(`Defender: units(${defender.units.current.length}), state: ${defender.state}`);
	// TODO: Create battle log file and save it.
}
