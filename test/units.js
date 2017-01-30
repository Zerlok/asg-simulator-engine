"use strict"

var chai = require('chai');
var expect = chai.expect;

var Units = require('../engine').units;


const maxUnits = 2;
var unitsList = [];


describe('Units', function() {
	it('Different types.', function() {
		for (var type in Units.config.types) {
			for (var x = 0; x < maxUnits; ++x) {
				var unit = new Units.Unit(type);
				unitsList.push(unit);
				expect(unit.type).to.equal(type);
			}
		}
	});

	it('Simply parsing.', function() {
		var text = Units.io.toJson(unitsList);
		var data = Units.io.fromJson(text);
		expect(data).to.eql(unitsList);
	});
});
