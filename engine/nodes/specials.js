"use strict"

var Funcs = require('../common/functions');
var Base = require('./base');
var cfg = require('../config').engine;


// --------------------------- Logical Nodes --------------------------- //

class RootNode extends Base.Node {
	constructor(id) {
		super(
			id,
			cfg.nodes.names[0],
			cfg.nodes.types[0],
			cfg.nodes.root.outputs, // for simulator only!
			cfg.nodes.root.outputs
		);
	}

	initData(selfUnits, enemyUnits, roundNum) {
		this.inputs[cfg.units.name].setConstData({
				own: selfUnits,
				enemies: enemyUnits
		});
		this.inputs.round.setConstData(roundNum);
	}

	_executeSpecial() {
		for (var name in this.inputs) {
			this.outputs[name].data = this.inputs[name].data;
		}
	}
}

class FilterNode extends Base.Node {
	constructor(id) {
		super(
			id,
			cfg.nodes.names[1],
			cfg.nodes.types[1],
			cfg.nodes.filter.inputs,
			cfg.nodes.filter.outputs
		);
	}

	isReady() {
		var unitsPort = this.inputs[cfg.units.name];
		if (unitsPort.empty)
			return false;

		for (var name of cfg.nodes.filter.filterFields) {
			var inPort = this.inputs[name];
			if (!inPort.empty)
				return true;
		}

		return false;
	}

	getCriterias() {
		var UnitCriteria = function(fieldName, opName, value) {
			return {
				field: fieldName,
				operator: Funcs.operators[opName],
				value: value,
				validate: function(unit) {
					return this.operator(unit[this.field], this.value);
				}
			};
		};
		var UnitTypeCriteria = function(opName, value) {
			return {
				operator: Funcs.operators[opName],
				value: cfg.units.hierarchy.indexOf(value),
				validate: function(unit) {
					return this.operator(cfg.units.hierarchy.indexOf(unit.type), this.value);
				}
			};
		};

		var lst = [];
		var data, type, crit;
		for (var name of cfg.nodes.filter.filterFields) {
			data = this.inputs[name].data;
			type = typeof data;
			if (data != null) {
				if ((type == "number")
						|| (type == "string")
						|| (!data.hasOwnProperty("op")
						|| (!data.hasOwnProperty("value"))))
					data = {op: 'eq', value: data};

				if (name == "type") {
					crit = new UnitTypeCriteria(data.op, data.value);
				} else if (Funcs.operators.hasOwnProperty(data.op)) {
					crit = new UnitCriteria(name, data.op, data.value);
				} else {
					console.error(`Can't create criteria for unit field '${name}' with parametrs op='${data.op}', value='${data.value}'!`);
				}

				lst.push(crit);
			}
		}

		return lst;
	}

	_executeSpecial() {
		// TODO: make byPosition criteria be an area (horizontal and vertical ranges).
		var criterias = this.getCriterias();
		var filterFunc = function(unit) {
			for (var i = 0; i < criterias.length; ++i) {
				if (!criterias[i].validate(unit)) {
					return null;
				}
			}
			return unit;
		};

		var units = this.outputs[cfg.units.name];
		units.data = {};
		units.data[cfg.units.self] = [];
		units.data[cfg.units.enemy] = [];

		var side = this.inputs["side"].data;
		if ((side == null)
				|| (side == cfg.nodes.filter.sideOptions[1])) {
			units.data[cfg.units.self] = this.inputs[cfg.units.name].data[cfg.units.self].filter(filterFunc);
		}
		if ((side == null)
				|| (side == cfg.nodes.filter.sideOptions[2])) {
			units.data[cfg.units.enemy] = this.inputs[cfg.units.name].data[cfg.units.enemy].filter(filterFunc);
		}
		this.outputs.amount.data = units.data[cfg.units.self].length + units.data[cfg.units.enemy].length;
	}
}

class ManipulatorNode extends Base.Node {
	constructor(id) {
		super(
			id,
			cfg.nodes.names[2],
			cfg.nodes.types[1],
			cfg.nodes.manipulator.inputs,
			cfg.nodes.manipulator.outputs
		);
	}

	_executeSpecial() {
		var name = this.inputs.operation.data;
		var op = Funcs.unique[name];
		if (op == null)
			return console.error(`Undefined set operation: ${name}!`);

		this.outputs.resultSet.data = {};
		this.outputs.resultSet.data[cfg.units.self] = op(this.inputs.leftSet.data[cfg.units.self], this.inputs.rightSet.data[cfg.units.self]);
		this.outputs.resultSet.data[cfg.units.enemy] = op(this.inputs.leftSet.data[cfg.units.enemy], this.inputs.rightSet.data[cfg.units.enemy]);
		this.outputs.amount.data = this.outputs.resultSet.data[cfg.units.self].length + this.outputs.resultSet.data[cfg.units.enemy].length;
	}
}

class ConditionalNode extends Base.Node {
	constructor(id) {
		super(
			id,
			cfg.nodes.names[3],
			cfg.nodes.types[1],
			cfg.nodes.conditional.inputs,
			cfg.nodes.conditional.outputs
		);
	}

	_executeSpecial() {
		var name = this.inputs.operator.data;
		var op = Funcs.operators[name];
		if (op == null) {
			return console.error(`Can't use undefined operator '${name}'!`);
		}

		this.outputs.resultValue.data = op(this.inputs.leftValue.data, this.inputs.rightValue.data);
	}
}

class ForkNode extends Base.Node {
	constructor(id) {
		super(
			id,
			cfg.nodes.names[4],
			cfg.nodes.types[1],
			cfg.nodes.fork.inputs,
			cfg.nodes.fork.outputs
		);

		this[cfg.nodes.fork.trueFieldName] = {};
		this[cfg.nodes.fork.falseFieldName] = {};
		for (var name of cfg.nodes.fork.outputFields) {
			this[cfg.nodes.fork.trueFieldName][name] = this.outputs[cfg.nodes.fork.trueFieldName + cfg.nodes.fork.separator + name];
			this[cfg.nodes.fork.falseFieldName][name] = this.outputs[cfg.nodes.fork.falseFieldName + cfg.nodes.fork.separator + name];
		}
	}

	isReady() {
		return (!this.inputs.result.empty);
	}

	getOutput(field) {
		if (this.inputs.result.data) {
			return this[cfg.nodes.fork.trueFieldName][field];
		} else {
			return this[cfg.nodes.fork.falseFieldName][field];
		}
	}

	_executeSpecial() {
		this.refreshOutputs();
		for (var name of cfg.nodes.fork.outputFields) {
			this.getOutput(name).data = this.inputs[name].data;
		}
	}
}


// --------------------------- Units Cmds --------------------------- //

class FireCmdNode extends Base.Node {
	constructor(id) {
		super(
			id,
			cfg.nodes.names[5],
			cfg.nodes.types[2],
			cfg.nodes.cmdFire.inputs,
			cfg.nodes.cmdFire.outputs
		);
	}

	setValue(field, value) {
		console.error(`${this.name} node has not constant input values!`);
		return this;
	}

	getValues() {
		return { 0: this.inputs[cfg.units.name].data };
	}

	_executeSpecial() {
		var targets = this.inputs[cfg.units.name].data[cfg.units.enemy];
		var len = targets.length;
		if (len == 0)
			return;

		var totalDmg = 0;
		var ownUnits = this.inputs[cfg.units.name].data[cfg.units.enemy];
		for (var i = 0; i < ownUnits.length; ++i) {
			totalDmg += ownUnits[i].fire();
		}

		var target, dmg;
		while (totalDmg > 0) {
			target = targets[Funcs.rand(0, len-1)];
			dmg = Funcs.rand(0, totalDmg/2) + 1; // NOTE: dmg may equals 0, so +1 is required.
			target.receiveDamage(dmg);
			totalDmg -= dmg;
		}
	}
}

class HoldCmdNode extends Base.Node {
	constructor(id) {
		super(
			id,
			cfg.nodes.names[6],
			cfg.nodes.types[2],
			cfg.nodes.cmdHold.inputs,
			cfg.nodes.cmdHold.outputs
		);
	}

	setValue(field, value) {
		console.error(`${this.name} node has not constant input values!`);
		return this;
	}

	getValues() {
		return { 0: this.inputs[cfg.units.name].data };
	}

	_executeSpecial() {
		var ownUnits = this.inputs[cfg.units.name].data[cfg.units.self];
		for (var i = 0; i < ownUnits.length; ++i) {
			ownUnits[i].restoreShields();
		}
	}
}

// class MoveCmdNode extends Base.Node {
// 	constructor(id) {
// 		super(id, cfg.nodes.names[7], cfg.nodes.types[2], [cfg.units.name], []);
// 	}
//
// 	setValue(field, value) {
// 		console.error(`${this.name} node has not constant input values!`);
// 		return this;
// 	}
//
// 	_executeSpecial() {
//
// 	}
// }


// --------------------------- Factory Building --------------------------- //

// class DealNode extends Base.Node {
// 	constructor(id) {
// 		super(id, cfg.nodes.names[8], cfg.nodes.types[3], ['deal'], []);
// 	}
//
// 	setValue(field, value) {
// 		console.error(`${this.name} node has not constant input values!`);
// 		return this;
// 	}
//
// 	_executeSpecial() {
//
// 	}
// }


// --------------------------- Factory Building --------------------------- //

var Factory = require('../common/factory');
var nodeFactory = new Factory();
nodeFactory.registrate(cfg.nodes.names[0], RootNode);
nodeFactory.registrate(cfg.nodes.names[1], FilterNode);
nodeFactory.registrate(cfg.nodes.names[2], ManipulatorNode);
nodeFactory.registrate(cfg.nodes.names[3], ConditionalNode);
nodeFactory.registrate(cfg.nodes.names[4], ForkNode);
nodeFactory.registrate(cfg.nodes.names[5], FireCmdNode);
nodeFactory.registrate(cfg.nodes.names[6], HoldCmdNode);
// nodeFactory.registrate('cmdMove', MoveCmdNode);
// nodeFactory.registrate('dealer', DealNode);


module.exports = {
	Root: RootNode,
	Filter: FilterNode,
	Manipulator: ManipulatorNode,
	Conditional: ConditionalNode,
	Fork: ForkNode,

	CmdFire: FireCmdNode,
	CmdHold: HoldCmdNode,
	// CmdMove: MoveCmdNode,

	// Dealer: DealNode,

	factory: nodeFactory
};
