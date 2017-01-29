"use strict"

var chai = require('chai');
var expect = chai.expect;

var Units = require('../units/unit');
Units.io = require('../units/io');


var units = [];
var maxUnits = 2;
for (var type in Units.config.types) {
	for (var x = 0; x < maxUnits; ++x) {
		units.push(new Units.Unit(type));
	}
}


const tests = [
	describe('Units', function() {
		it('Simply parsing.', function() {
			var text = Units.io.toJson(units);
			var data = Units.io.fromJson(text);

			expect(units).to.eql(data);
			console.log(data);
		});
	})
];


module.exports = tests;
