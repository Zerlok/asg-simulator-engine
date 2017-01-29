"use strict"

var chai = require('chai');
var expect = chai.expect;

var BaseUnits = require('../units/base');
BaseUnits.io = require('../units/io');


const maxUnits = 2;
var unitsList = [];


const tests = [
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
	})
];


module.exports = tests;
