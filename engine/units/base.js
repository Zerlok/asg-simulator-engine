"use strict"

var Funcs = require('../common/functions');
var unitsCfg = require('../config').engine.units;


class Unit {
	constructor(type) {
		for (var i in unitsCfg.fields.names) {
			var field = unitsCfg.fields.names[i];
			this[field] = unitsCfg.types[type][field];
		}
	}

	isAlive() {
		return (this.health > 0);
	}

	fire() {
		return Funcs.rand(0, 100) * 10;
	}

	receiveDamage(dmg) {
		this.shields -= dmg;
		if (this.shields < 0) {
			this.health += this.shields;
			this.shields = 0;
		}
	}

	restoreShields() {
		this.shields += 100;
	}
}


function randomUnitsBuilder(amount) {
	var lst = [];
	for (var i = 0; i < amount; ++i) {
		var type = unitsCfg.hierarchy[Funcs.rand(0, unitsCfg.hierarchy.length)];
		lst.push(new Unit(type));
	}
	return lst;
}


module.exports = {
	Unit: Unit,
	config: unitsCfg,
	builder: {
		total: randomUnitsBuilder
	}
};
