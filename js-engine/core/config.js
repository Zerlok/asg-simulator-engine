"use strict"

var funcs = require('../common/functions');


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
		states: ["continues", "won", "loose", "surrender", "draw"]
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

const hp = 'health';
const shp = 'shields';


// ------------------------------ BATTLE CONFIG ------------------------------ //

const width = 10;
const height = 10;
const battle = {
	field: {width: width, height: height},
	states: {
		names: titles.battle.states,
		default: titles.battle.states[0]
	},
	maxRounds: 256
};


// ------------------------------ UNITS CONFIG ------------------------------ //

var units = {
	self: titles.battle.side.self,
	enemy: titles.battle.side.enemy,

	typesOrder: [
		'fighter',
		'hedgehopper',
		'cruiser',
		'battleship',
		'demolisher'
	],
	types: {}, // Will be filled by appender function (look down).
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

		generators: {}
	},
	scoreFields: ['health', 'shields', 'shieldRegen', 'speed', 'fuel'],
};
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

// Create unit prototype for every type.
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
	root: titles.nodes.types[0],
	types: titles.nodes.types,
};

// Special nodes.
nodes['root'] = {
	inputs: [units.self, units.enemy, 'round'],
	outputs: [units.self, units.enemy, 'round']
};
nodes['filter'] = {
	inputs: [titles.units.name, 'byType', 'byHealth', 'byPosition'],
	outputs: [titles.units.name],
	criterias: ['byType', 'byHealth', 'byPosition'],
	operators: funcs.operators.names
};
nodes['manipulator'] = {
	inputs: ['left', 'right', 'operation'],
	outputs: ['result'],
	operations: ['intersection', 'union', 'difference']
};
nodes['conditional'] = {
	inputs: ['left', 'right', 'operator'],
	outputs: ['result'],
	operators: funcs.operators.names
};
nodes['fork'] = {
	inputs: [units.self, units.enemy, 'result'],
	outputs: ['onTrue_' + units.self, 'onTrue_' + units.enemy,
			'onFalse_' + units.self, 'onFalse_' + units.enemy],
	passing: [units.self, units.enemy]
};
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
	project: titles.app.project,
	appname: titles.app.name,
	shortname: titles.app.shortappname,
	version: version,

	engine: {
		units: units,
		nodes: nodes,
		battle: battle
	}
};
