"use strict"

var Funcs = require('../common/functions');
var Base = require('./base');
var cfg = require('../config').engine;


// --------------------------- Logical Nodes --------------------------- //

class RootNode extends Base.Node {
	constructor(id, name) {
		super(id, name, cfg.nodes.defaultFields, cfg.nodes.defaultFields);
	}

	initData(selfUnits, enemyUnits, roundNum, deals) {
		this.inputs[cfg.units.name].setConstData({
				own: selfUnits,
				enemies: enemyUnits
		});
		this.inputs.round.setConstData(roundNum);
		this.inputs.deals.setConstData(deals);
	}

	_executeSpecial() {
		for (var name in this.inputs) {
			this.outputs[name].data = this.inputs[name].data;
		}
	}
}

class FilterNode extends Base.Node {
	constructor(id, name) {
		const sideFilter = {
			name: "side",
			options: ["any", cfg.units.self, cfg.units.enemy]
		};
		const unitsFilter = ['type', 'hull'];

		super(id, name, [cfg.units.name, sideFilter.name].concat(unitsFilter), [cfg.units.name]);
		this.sideFilter = sideFilter;
		this.unitsFilter = unitsFilter;
	}

	isReady() {
		var unitsPort = this.inputs[cfg.units.name];
		if (unitsPort.empty || (unitsPort.data == null))
			return false;

		for (var name of this.unitsFilter) {
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
		for (var name of this.unitsFilter) {
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
			for (var i = 0; i < criterias.length; ++i)
				if (!criterias[i].validate(unit))
					return null;
			return unit;
		};

		var units = this.outputs[cfg.units.name];
		units.data = {};
		units.data[cfg.units.self] = [];
		units.data[cfg.units.enemy] = [];

		var side = this.inputs[this.sideFilter.name].data;
		if ((side == null)
				|| (side == this.sideFilter.options[0])
				|| (side == this.sideFilter.options[1])) {
			units.data[cfg.units.self] = this.inputs[cfg.units.name].data[cfg.units.self].filter(filterFunc);
		}
		if ((side == null)
				|| (side == this.sideFilter.options[0])
				|| (side == this.sideFilter.options[2])) {
			units.data[cfg.units.enemy] = this.inputs[cfg.units.name].data[cfg.units.enemy].filter(filterFunc);
		}
	}
}

class ManipulatorNode extends Base.Node {
	constructor(id, name) {
		super(id, name, ['leftSet', 'rightSet', 'operation'], ['resultSet']);
	}

	_executeSpecial() {
		var name = this.inputs.operation.data;
		var op = Funcs.unique[name];
		if (op == null)
			return console.error(`Undefined set operation: ${name}!`);

		this.outputs.resultSet.data = {};
		this.outputs.resultSet.data[cfg.units.self] = op(this.inputs.leftSet.data[cfg.units.self], this.inputs.rightSet.data[cfg.units.self]);
		this.outputs.resultSet.data[cfg.units.enemy] = op(this.inputs.leftSet.data[cfg.units.enemy], this.inputs.rightSet.data[cfg.units.enemy]);
	}
}

class ConditionalNode extends Base.Node {
	constructor(id, name) {
		super(id, name, ['leftValue', 'rightValue', 'operator'], ['resultValue']);
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
	constructor(id, name) {
		const sep = "_";
		const trueFieldName = "onTrue";
		const falseFieldName = "onFalse";
		var inputsNames = ['result'].concat(cfg.nodes.defaultFields);
		var outputsNames = [];
		for (var field of inputsNames) {
			outputsNames.push(trueFieldName+sep+field);
			outputsNames.push(falseFieldName+sep+field);
		}

		super(id, name, inputsNames, outputsNames);
		this.inputsNames = inputsNames;
		this.trueFieldName = trueFieldName;
		this.falseFieldName = falseFieldName;

		this[trueFieldName] = {};
		this[falseFieldName] = {};
		for (var field of inputsNames) {
			this[trueFieldName][field] = this.outputs[trueFieldName+sep+field];
			this[falseFieldName][field] = this.outputs[falseFieldName+sep+field];
		}
	}

	getOutput(field) {
		if (this.inputs.result.data) {
			return this[this.trueFieldName][field];
		} else {
			return this[this.falseFieldName][field];
		}
	}

	_executeSpecial() {
		this.refreshOutputs();
		for (var name of inputsNames) {
			this.getOutput(name).data = this.inputs[name].data;
		}
	}
}


// --------------------------- Units Cmds --------------------------- //

class FireCmdNode extends Base.Node {
	constructor(id, name) {
		super(id, name, [cfg.units.name], []);
	}

	setValue(field, value) {
		console.error(`${this.name} node has not constant input values!`);
		return this;
	}

	_executeSpecial() {
		var targets = this.inputs.enemies.data[cfg.units.enemy];
		var len = tarrgets.length;
		if (len == 0)
			return;

		var totalDmg = 0;
		var ownUnits = this.inputs.data[cfg.units.self];
		for (var i = 0; i < ownUnits.length; ++i) {
			totalDmg += ownUnits[i].fire();
		}

		var target, dmg;
		while (totalDmg > 0) {
			target = targets[Funcs.rand(0, len-1)];
			dmg = Funcs.rand(1, totalDmg/2);
			target.receiveDamage(dmg);
			totalDmg -= dmg;
		}
	}
}

class HoldCmdNode extends Base.Node {
	constructor(id, name) {
		super(id, name, [cfg.units.name], []);
	}

	setValue(field, value) {
		console.error(`${this.name} node has not constant input values!`);
		return this;
	}

	_executeSpecial() {
		var ownUnits = this.inputs.own.data[cfg.units.self];
		for (var i = 0; i < ownUnits.length; ++i) {
			ownUnits[i].restoreShields();
		}
	}
}

class MoveCmdNode extends Base.Node {
	constructor(id, name) {
		super(id, name, [cfg.units.name], []);
	}

	setValue(field, value) {
		console.error(`${this.name} node has not constant input values!`);
		return this;
	}

	_executeSpecial() {

	}
}


// --------------------------- Factory Building --------------------------- //

class DealNode extends Base.Node {
	constructor(id, name) {
		super(id, name, ['deal'], []);
	}

	setValue(field, value) {
		console.error(`${this.name} node has not constant input values!`);
		return this;
	}

	_executeSpecial() {

	}
}


// --------------------------- Factory Building --------------------------- //

var Factory = require('../common/factory');
var nodeFactory = new Factory();
nodeFactory.registrate('root', RootNode);
nodeFactory.registrate('filter', FilterNode);
nodeFactory.registrate('manipulator', ManipulatorNode);
nodeFactory.registrate('conditional', ConditionalNode);
nodeFactory.registrate('fork', ForkNode);
nodeFactory.registrate('cmdFire', FireCmdNode);
nodeFactory.registrate('cmdHold', HoldCmdNode);
nodeFactory.registrate('cmdMove', MoveCmdNode);
nodeFactory.registrate('dealer', DealNode);


module.exports = {
	Root: RootNode,
	Filter: FilterNode,
	Manipulator: ManipulatorNode,
	Conditional: ConditionalNode,
	Fork: ForkNode,

	CmdFire: FireCmdNode,
	CmdHold: HoldCmdNode,
	CmdMove: MoveCmdNode,

	Dealer: DealNode,

	factory: nodeFactory
};
