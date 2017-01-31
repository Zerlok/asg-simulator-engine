"use strict"

var Funcs = require('../common/functions');
var unitsCfg = require('../config').engine.units;


class Unit {
	constructor(type) {
		this.type = type;
		for (var i in unitsCfg.fields.names) {
			var field = unitsCfg.fields.names[i];
			this[field] = unitsCfg.types[type][field];
		}
	}

	isAlive() {
		return (this.hull > 0);
	}

	fire() {
		var offset = this.damage/20;
		return Funcs.rand(this.damage-offset, this.damage+offset);
	}

	receiveDamage(dmg) {
		this.shields -= dmg;
		if (this.shields < 0) {
			this.hull += this.shields;
			this.shields = 0;
		}
	}

	restoreShields() {
		if (this.shields < this.shieldsMax)
			this.shields += this.shieldsRegen;
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
