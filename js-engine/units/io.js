"use strict"

var Units = require('./base');


function fromJson(text) {
	if (text == null)
		return [];

	var lst = [];
	var data = JSON.parse(text);

	for (var type in data) {
		var amount = data[type];
		for (var i = 0; i < amount; ++i) {
			lst.push(new Units.Unit(type));
		}
	}

	return lst;
}


function toJson(unitsList) {
	var data = {};
	for (var i in Units.config.typesOrder) {
		var type = Units.config.typesOrder[i];
		data[type] = 0;
	}

	for (var i in unitsList) {
		var unit = unitsList[i];
		++data[unit.type];
	}

	return JSON.stringify(data);
}


module.exports = {
	fromJson: fromJson,
	toJson: toJson,
	config: Units.config
}
