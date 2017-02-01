"use strict"

var chai = require('chai');
var expect = chai.expect;

var Units = require('../engine').units;


const maxUnits = 2;
var unitsList = [];


describe("Units:", function() {
	it("Different types", function() {
		var unit;
		for (var type in Units.config.types) {
			for (var x = 0; x < maxUnits; ++x) {
				unit = new Units.Unit(type);
				expect(unit.type).to.equal(type);
				expect(unit.isAlive()).to.be.true;
				for (var name of Units.config.fields) {
					expect(unit.hasOwnProperty(name)).to.be.true;
				}

				unitsList.push(unit);
			}
		}
	});

	it("Simply parsing", function() {
		var text = Units.io.toJson(unitsList);
		var data = Units.io.fromJson(text);
		expect(data).to.eql(unitsList);
	});

	it("Fire", function() {
		for (var i = 0; i < unitsList.length; ++i) {
			expect(unitsList[i].fire()).to.be.above(0);
		}
	});

	it("Shields regeneration", function() {
		var before;
		for (var unit of unitsList) {
			before = {
				hull: unit.hull,
				shields: unit.shields
			};

			unit.restoreShields();
			expect(unit.hull).to.equal(before.hull);
			expect(unit.shields).to.be.above(before.shields);
		}
	});

	it("Damage receiving", function() {
		for (var unit of unitsList) {
			expect(unit.isAlive()).to.be.true;
		}

		var dmg;
		var dmgFunc = function(unit) { return unit.hull + unit.shields; };
		for (var unit of unitsList) {
			unit.receiveDamage(dmgFunc(unit));
			expect(unit.isAlive()).to.be.false;
			expect(unit.hull).to.be.equal(0);
			expect(unit.shields).to.be.equal(0);

			unit.receiveDamage(1000);
			expect(unit.hull).to.be.equal(0);
			expect(unit.shields).to.be.equal(0);
		}
	});
});
