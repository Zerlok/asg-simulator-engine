"use strict"

var Funcs = require('../common/functions');
var unitsCfg = require('../config').engine.units;


class Unit {
	constructor(type) {
		this.type = type;
		var name;
		for (var i = 0; i < unitsCfg.fields.length; ++i) {
			name = unitsCfg.fields[i];
			this[name] = unitsCfg.types[type][name];
		}
	}

	isAlive() {
		return (this.hull > 0);
	}

	fire() {
		if (!this.isAlive())
			return 0;

		const offset = this.damage/20; // TODO: apply accuracy.
		return Funcs.rand(this.damage-offset, this.damage+offset);
	}

	receiveDamage(dmg) {
		if (!this.isAlive())
			return false;

		this.shields -= dmg; // TODO: apply dodge.
		if (this.shields < 0) {
			this.hull += this.shields;
			this.shields = 0;
		}
		return true;
	}

	restoreShields() {
		if (!this.isAlive())
			return false;

		if (this.shields < this.shieldsMax)
			this.shields += this.shieldsRegen;

		return true;
	}
}


function randomUnitsBuilder(amount) {
	var lst = [];
	var type;
	for (var i = 0; i < amount; ++i) {
		type = unitsCfg.hierarchy[Funcs.rand(0, unitsCfg.hierarchy.length)];
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
