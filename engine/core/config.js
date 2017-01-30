"use strict"

const funcs = require('../common/functions');


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
			'health',
			'shields',
			'shieldRegen',
			'accuracy',
			'dodging',
			'position',
			'speed',
			'fuel',
			'fuelWaste',
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

	typesOrder: [
		'fighter',
		'hedgehopper',
		'cruiser',
		'battleship',
		'demolisher'
	],
	types: {}, // Will be filled below.
	fields: {
		names: titles.units.fields,

		type: {},
		health: {		minVal: 50,						maxVal: 10000000 },
		shields: {		minVal: 50,						maxVal: 10000 },
		shieldRegen: {	minVal: 1,						maxVal: 300 },
		accuracy: {		minVal: 10.0,					maxVal: 98.0 },
		dodging: {		minVal: 5.0,					maxVal: 98.0 },
		position: {},
		speed: {		minVal: 1,						maxVal: 2*Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))/(width+height) },
		fuel: {			minVal: battle.maxRounds/2,		maxVal: battle.maxRounds*3/4 },
		fuelWaste: {	minVal: 1,						maxVal: 1 },
		score: {		minVal: 1000,					maxVal: 10000000 },

		generators: {} // Will be filled below.
	},
	scoreFields: ['health', 'shields', 'shieldRegen', 'speed', 'fuel'],
};

// Create generator functions (field value setters by unit type).
function clampUF(name, value) { return funcs.clamp(units.fields[name].minVal, units.fields[name].maxVal, value); }
units.fields.generators = {
	"type": function(n) { return 			units.typesOrder[n];										},
	health: function(n) { return		clampUF('health',		20*Math.pow(5, n+1)/(n+1));			},
	shields: function(n) { return		clampUF('shields',		(n+10)*Math.pow(8, n+1));			},
	shieldRegen: function(n) { return	clampUF('shieldRegen',	10*Math.pow(10, (n+1)/10));			},
	accuracy: function(n) { return		clampUF('accuracy',		(120 - (40/Math.pow(n+1, 2))));		},
	dodging: function(n) { return		clampUF('dodging',		80/(n+1));							},
	speed: function(n) { return			clampUF('speed',		16/(n+2));							},
	fuel: function(n) { return			clampUF('fuel',			25*Math.pow(n+1, 2));				},
	fuelWaste: function(n) { return		clampUF('fuelWaste',	(n+1)/2*Math.pow(n, 2));			},
};
units.fields.generators['score'] = function(n) {
	const cntr = units.scoreFields.length;
	var sum = 0;
	for (var i in units.scoreFields) {
		var name = units.scoreFields[i];
		sum += units.fields.generators[name](n);
	}
	return (cntr * Math.pow(sum, 2/cntr));
}

// Create unit prototype for every type (using generators).
for (var i in units.typesOrder) {
	var type = units.typesOrder[i];
	var obj = {};
	for (var j = 0; j < units.fields.names.length; ++j) {
		var name = units.fields.names[j];
		var fieldGen = units.fields.generators[name];
		if (fieldGen)
			obj[name] = fieldGen(i);
	}
	units.types[type] = obj;
}


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
	criterias: ['type', 'health', 'position'],
	operators: funcs.operators
};
for (var crt of nodes.filter.criterias) {
	nodes.filter.inputs.push(crt);
}

nodes['manipulator'] = {
	inputs: ['left', 'right', 'operation'],
	outputs: ['ships'],
	operations: {
		names: ['intersection', 'union', 'difference'],
		intersection: funcs.sets.intersection,
		union: funcs.sets.union,
		difference: funcs.sets.difference
	}
};

nodes['conditional'] = {
	inputs: ['left', 'right', 'operator'],
	outputs: ['result'],
	operators: funcs.operators
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
	appname: titles.app.fullname,
	shortname: titles.app.shortappname,
	version: version,

	engine: {
		units: units,
		nodes: nodes,
		battle: battle
	}
};
