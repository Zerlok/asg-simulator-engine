"use strict"

var unitsCfg = require('../config').engine.units;


class Unit {
	constructor(type) {
		for (var i in unitsCfg.fields.names) {
			var field = unitsCfg.fields.names[i];
			this[field] = unitsCfg.types[type][field];
		}
	}
}


module.exports = {
	Unit: Unit,
	config: unitsCfg
};
