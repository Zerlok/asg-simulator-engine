"use strict"

const Funcs = require('./common/functions');


// ------------------------------ TITLES ------------------------------ //

const version = {major: 0, minor: 1, str: "ver 0.1-alpha"};
const titles = {
	project: {
		fullname: "Admirals of Stars and Galaxies",
		shortname: "ASG"
	},
	app: {
		fullname: "ASG - Strategy Simulator Engine",
		shortname: "ASG-engine"
	},

	battle: {
		side: {self: "own", enemy: "enemies"},
		states: ["begins", "continues", "ended"],
		results: ["won", "lost", "draw"]
	},

	units: {
		name: "ships",
		fields: [
			'type',
			'hull',
			'shields',
			'shieldsMax',
			'shieldsRegen',
			'damage',
			'score'
		]
	},

	nodes: {
		types: [
			'root',
			'filter',
			'manipulator',
			'conditional',
			'fork',
			'cmdFire',
			'cmdHold',
			'cmdMove',
		]
	}
};


// ------------------------------ BATTLE CONFIG ------------------------------ //

const width = 10;
const height = 10;
const battle = {
	field: {width: width, height: height},
	states: {
		names: titles.battle.states,
		prepared: titles.battle.states[0],
		started: titles.battle.states[1],
		finished: titles.battle.states[2]
	},
	results: {
		names: titles.battle.results,
		win: {
			name: titles.battle.results[0],
			short: "+",
			message: function(att, def) { return att.name+" won the batlle with "+def.name; }
		},
		loose: {
			names: titles.battle.results[1],
			short: "-",
			message: function(att, def) { return att.name+" lost the batlle with "+def.name; }
		},
		draw: {
			names: titles.battle.results[2],
			short: "*",
			message: function(att, def) { return "the battle between "+att.name+" and "+def.name+" ended in a draw"; }
		}
	},
	maxRounds: 256
};


// ------------------------------ UNITS CONFIG ------------------------------ //

var units = {
	name: titles.units.name,
	self: titles.battle.side.self,
	enemy: titles.battle.side.enemy,

	hierarchy: [
		'fighter',
		'hedgehopper',
		'cruiser',
		'battleship',
		'demolisher'
	],
	types: {
		fighter: {
			type: "fighter",
			hull: 100,
			shields: 30,
			shieldsMax: 100,
			shieldsRegen: 30,
			damage: 40,
			score: 270
		},
		hedgehopper: {
			type: "hedgehopper",
			hull: 500,
			shields: 100,
			shieldsMax: 400,
			shieldsRegen: 100,
			damage: 160,
			score: 290
		},
		cruiser: {
			type: "cruiser",
			hull: 1200,
			shields: 200,
			shieldsMax: 1000,
			shieldsRegen: 200,
			damage: 500,
			score: 330,
		},
		battleship: {
			type: "battleship",
			hull: 3000,
			shields: 320,
			shieldsMax: 2100,
			shieldsRegen: 320,
			damage: 1100,
			score: 400
		},
		demolisher: {
			type: "demolisher",
			hull: 6000,
			shields: 400,
			shieldsMax: 3800,
			shieldsRegen: 400,
			damage: 3000,
			score: 560
		}
	},
	fields: {
		names: titles.units.fields,
	}
};


// ------------------------------ NODES CONFIG ------------------------------ //

var nodes = {
	main: titles.nodes.types[0],
	types: titles.nodes.types,
	root: {
		inputs: [units.self, units.enemy, 'round'],
		outputs: [units.self, units.enemy, 'round']
	}
};

// Specials ...
nodes['filter'] = {
	inputs: [titles.units.name],
	outputs: [titles.units.name],
	criterias: ['type', 'hull', 'position'],
	operators: Funcs.operators
};
for (var crt of nodes.filter.criterias) {
	nodes.filter.inputs.push(crt);
}

nodes['manipulator'] = {
	inputs: ['left', 'right', 'operation'],
	outputs: ['ships'],
	operations: {
		names: ['intersection', 'union', 'difference'],
		intersection: Funcs.sets.intersection,
		union: Funcs.sets.union,
		difference: Funcs.sets.difference
	}
};

nodes['conditional'] = {
	inputs: ['left', 'right', 'operator'],
	outputs: ['result'],
	operators: Funcs.operators
};

nodes['fork'] = {
	inputs: [units.self, units.enemy, 'result'],
	outputs: [],
	trueField: 'onTrue',
	falseField: 'onFalse',
	passing: [units.self, units.enemy, 'result']
};
for (var name of nodes.fork.passing) {
	nodes.fork.outputs.push(nodes.fork.trueField+'_'+name);
	nodes.fork.outputs.push(nodes.fork.falseField+'_'+name);
}

nodes['cmdFire'] = {
	inputs: [units.self, units.enemy],
	outputs: []
};

nodes['cmdHold'] = {
	inputs: [units.self],
	outputs: []
};

nodes['cmdMove'] = {
	inputs: [units.self, 'offset', 'position'],
	outputs: []
};


// ------------------------------ MODULE EXPORT ------------------------------ //

module.exports = {
	project: titles.project.fullname,

	app: {
		fullname: titles.app.fullname,
		name: titles.app.shortappname,
		version: version,
		host: "localhost",
		port: 8000
	},

	engine: {
		units: units,
		nodes: nodes,
		battle: battle
	}
};
