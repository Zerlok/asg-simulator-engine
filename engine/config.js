"use strict"


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

	player: {
		deals: ["draw", "surrender"]
	},

	units: {
		name: "ships",
		types: [
			'fighter',
			'hedgehopper',
			'cruiser',
			'battleship',
			'demolisher'
		],
		fields: [
			'type',
			'hull',
			'shields',
			'shieldsMax',
			'shieldsRegen',
			'damage',
			'score',
			'order'
		],
		orders: ["fire", "hold", "move"],
		defaultOrder: "fire"
	},

	nodes: {
		types: [
			'root',
			'logical',
			'command',
			'deal'
		],
		names: [
			'root',
			'filter',
			'manipulator',
			'conditional',
			'fork',

			'cmdFire',
			'cmdHold',
			// 'cmdMove',

			// 'dealer'
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
	results: titles.battle.results,
	maxRounds: 128
};


// ------------------------------ UNITS CONFIG ------------------------------ //

var units = {
	name: titles.units.name,
	self: titles.battle.side.self,
	enemy: titles.battle.side.enemy,
	fields: titles.units.fields,
	hierarchy: titles.units.types,

	types: {
		fighter: {
			type: "fighter",
			hull: 100,
			shields: 30,
			shieldsMax: 100,
			shieldsRegen: 30,
			damage: 40,
			score: 270,
			order: titles.units.defaultOrder
		},
		hedgehopper: {
			type: "hedgehopper",
			hull: 500,
			shields: 100,
			shieldsMax: 400,
			shieldsRegen: 100,
			damage: 160,
			score: 290,
			order: titles.units.defaultOrder
		},
		cruiser: {
			type: "cruiser",
			hull: 1200,
			shields: 200,
			shieldsMax: 1000,
			shieldsRegen: 200,
			damage: 500,
			score: 330,
			order: titles.units.defaultOrder
		},
		battleship: {
			type: "battleship",
			hull: 3000,
			shields: 320,
			shieldsMax: 2100,
			shieldsRegen: 320,
			damage: 1100,
			score: 400,
			order: titles.units.defaultOrder
		},
		demolisher: {
			type: "demolisher",
			hull: 6000,
			shields: 400,
			shieldsMax: 3800,
			shieldsRegen: 400,
			damage: 3000,
			score: 560,
			order: titles.units.defaultOrder
		}
	}
};


// ------------------------------ NODES CONFIG ------------------------------ //

var fields = {
	types: {
		units: units.name,
		num: "number",
		str: "string",
		func: "function"
	},
	createUnits: function(name, choices) {
		return {
			name: name,
			type: units.name,
			choices: []
		}
	},
	createNum: function(name, choices) {
		return {
			name: name,
			type: "number",
			choices: ((choices != null) ? choices : [])
		};
	},
	createStr: function(name, choices) {
		return {
			name: name,
			type: "text",
			choices: ((choices != null) ? choices : [])
		};
	},
	createFunc: function(name, choices) {
		return {
			name: name,
			type: "function",
			choices: choices
		};
	}
};

var nodes = {
	main: titles.nodes.names[0],
	fields: fields,
	types: titles.nodes.types,
	names: titles.nodes.names,

	// For browser Node View.
	"root": {
		inputs: [],
		outputs: [
			fields.createUnits(units.name),
			fields.createNum("round")
		]
	},
	"filter": {
		inputs: [
			fields.createUnits(units.name),
			fields.createStr("side", [null, units.self, units.enemy]),
			fields.createStr("type", [null].concat(units.hierarchy)),
			fields.createNum("hull"),
			fields.createNum("shields")
		],
		outputs: [
			fields.createUnits(units.name),
			fields.createNum("amount")
		],
		filterFields: ["type", "hull", "shields"],
		sideOptions: [null, units.self, units.enemy]
	},
	"manipulator": {
		inputs: [
			fields.createUnits("leftSet"),
			fields.createUnits("rightSet"),
			fields.createFunc(
				"operation",
				["intersection", "union", "difference"]
			)
		],
		outputs: [
			fields.createUnits("resultSet"),
			fields.createNum("amount")
		],
	},
	"conditional": {
		inputs: [
			fields.createNum("leftValue"),
			fields.createNum("rightValue"),
			fields.createFunc(
				"operator",
				["eq", "ne", "lt", "le", "gt", "ge", "and", "or", "xor"]
			)
		],
		outputs: [
			fields.createNum("resultValue")
		],
	},
	"fork": {
		inputs: [
			fields.createUnits(units.name),
			fields.createNum("round"),
			fields.createNum("result"),
		],
		outputs: [
			fields.createUnits("onTrue_"+units.name),
			fields.createNum("onTrue_round"),
			fields.createUnits("onFalse_"+units.name),
			fields.createNum("onFalse_round")
		],
		separator: "_",
		trueFieldName: "onTrue",
		falseFieldName: "onFalse",
		outputFields: [units.name, "round"]
	},
	"cmdFire": {
		inputs: [ fields.createUnits(units.name) ],
		outputs: []
	},
	"cmdHold": {
		inputs: [ fields.createUnits(units.name) ],
		outputs: []
	}
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
