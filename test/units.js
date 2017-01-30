"use strict"

var chai = require('chai');
var expect = chai.expect;

var BaseUnits = require('../engine/units/base');
BaseUnits.io = require('../engine/units/io');


const maxUnits = 2;
var unitsList = [];


describe('Units', function() {
	it('Different types.', function() {
		for (var type in BaseUnits.config.types) {
			for (var x = 0; x < maxUnits; ++x) {
				var unit = new BaseUnits.Unit(type);
				unitsList.push(unit);
				expect(unit.type).to.equal(type);
			}
		}
	});

	it('Simply parsing.', function() {
		var text = BaseUnits.io.toJson(unitsList);
		var data = BaseUnits.io.fromJson(text);
		expect(data).to.eql(unitsList);
	});
});
