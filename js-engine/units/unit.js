"use strict"

var unitsCfg = require('../core/config').engine.units;

class BaseUnit {
	constructor(type) {
		for (var i in unitsCfg.fields.names) {
			var field = unitsCfg.fields.names[i];
			this[field] = unitsCfg.types[type][field];
		}
	}
}


module.exports = {
	Unit: BaseUnit,
	config: unitsCfg
};
