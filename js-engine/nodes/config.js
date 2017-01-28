"use strict"

const width = 10;
const height = 10;
const units = {name: 'units', self: 'own', enemy: 'enemies'};

function clamp(a, b, c) {
	return Math.max(a, Math.min(b, c));
}

function countable(x) {
	if (Array.isArray(x)) return x.length;
	else if (x == null) return 0;
	return x;
}

const formulas = {
	operators: {
		names: ['eq', 'ne', 'lt', 'gt', 'le', 'ge', 'and', 'or', 'xor'],
		eq: function(a, b) { return (countable(a) == countable(b)); },
		ne: function(a, b) { return (countable(a) != countable(b)); },
		lt: function(a, b) { return (countable(a) < countable(b)); },
		gt: function(a, b) { return (countable(a) > countable(b)); },
		le: function(a, b) { return (countable(a) <= countable(b)); },
		ge: function(a, b) { return (countable(a) >= countable(b)); },
		and: function(a, b) { return (countable(a) && countable(b)); },
		or: function(a, b) { return (countable(a) || countable(b)); },
		xor: function(a, b) {
			var x = countable(a);
			var y = countable(b);
			return ((x && !y) || (!x && y));
		}
	},
	units: {
		health: function(n) { return 20*Math.pow(5, n)/n; },
		shield: function(n) { return (n+9)*Math.pow(8, n); },
		regen: function(n) { return 10*Math.pow(10, n/10); },
		accuracy: function(n) { return clamp(10.0, 95.0, (120 - (50/Math.pow(n, 2)))); },
		dodging: function(n) { return clamp(5.0, 95.0, 80/n); },
		speed: function(n) { return clamp(1, Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))/(width+height), 8/n); },
		fuel: function(n) { return 25*Math.pow(n+1, 2); },
		waste: function(n) { return n/2*Math.pow(n, 2); }
	}
}

function score(n) {
	i = 0;
	sum = 0;
	for (var name in formulas.units) {
		sum += formulas.units[name](n);
		++i;
	}

	return Math.pow(sum, 1/i);
}


const asgConfig = {
	global: {
		fullname: "Admirals of Stars and Galaxies",
		shortname: "ASG",
		version: 0,
		versionStr: "0.0.0-alpha-alpha-alpha"
	},

	battlefield: {
		width: width,
		height: height
	},

	operators: formulas.operators,

	nodes: {
		unitsNames: units,
		root: {
			inputs: [units.self, units.enemy, 'round'],
			outputs: [units.self, units.enemy, 'round']
		},
		filter: {
			criterias: ['byType', 'byHealth', 'byPosition'],
			inputs: [units.name, 'byType', 'byHealth', 'byPosition'],
			outputs: [units.name]
		},
		manipulator: {
			operations: ['intersection', 'union', 'difference'],
			inputs: ['left', 'right', 'operation'],
			outputs: ['result']
		},
		conditional: {
			operators: formulas.operators.names,
			inputs: ['left', 'right', 'operator'],
			outputs: ['result']
		},
		fork: {
			passing: [units.self, units.enemy],
			inputs: [units.self, units.enemy, 'result'],
			outputs: [
				'onTrue_' + units.self, 'onTrue_' + units.enemy,
				'onFalse_' + units.self, 'onFalse_' + units.enemy,
			]
		},
		cmdFire: {
			inputs: [units.self, units.enemy],
			outputs: []
		},
		cmdHold: {
			inputs: [units.self],
			outputs: []
		},
		cmdMove: {
			inputs: [units.self, 'offset', 'position'],
			outputs: []
		}
	},

	units: {
		titleing: units,
		fields: [
			{ name: 'health', genf: formulas.units.health },
			{ name: 'shields', genf: formulas.units.shields },
			{ name: 'shieldRegen', genf: formulas.units.regen },
			{ name: 'accuracy', genf: formulas.units.accuracy },
			{ name: 'dodging', genf: formulas.units.dodging },
			{ name: 'position', genf: formulas.units.position },
			{ name: 'speed', genf: formulas.units.speed },
			{ name: 'fuel', genf: formulas.units.fuel },
			{ name: 'fuelWaste', genf: formulas.units.waste },
			{ name: 'score', genf: formulas.units.score }
		],
		typesOrder: ['fighter', 'hedgehopper', 'cruiser', 'battleship', 'demolisher'],
	}
};


module.exports = asgConfig;
