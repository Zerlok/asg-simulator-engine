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
	maxRounds: 8
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

var nodes = {
	main: titles.nodes.names[0],
	unitsField: units.name,
	defaultFields: [
		units.name,
		"round",
		"deals"
	],
	types: titles.nodes.types,
	names: titles.nodes.names,

	"root": {
		inputs: [],
		outputs: [ units.name, "round" ]
	},
	"filter": {
		inputs: [ units.name, "side", "type", "hull", "shields"],
		outputs: [ units.name ]
	},
	"manipulator": {
		inputs: ["leftSet", "rightSet", "operator"],
		outputs: ["resultSet"]
	},
	"conditional": {
		inputs: ["leftValue", "rightValue", "operator"],
		outputs: ["resultValue"]
	},
	"fork": {
		inputs: [ units.name, "round", "result" ],
		outputs: [ "onTrue_"+units.name, "onTrue_round", "onFalse_"+units.name, "onFalse_round" ]
	},
	"cmdFire": {
		inputs: [ units.name ],
		outputs: []
	},
	"cmdHold": {
		inputs: [ units.name ],
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
