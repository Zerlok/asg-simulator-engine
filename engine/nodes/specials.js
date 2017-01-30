"use strict"

var Base = require('./base');
var cfg = require('../config').engine;
var nodesCfg = cfg.nodes;


// --------------------------- Logical Nodes --------------------------- //

class RootNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.root.inputs, nodesCfg.root.outputs);
	}

	initData() {
		var keys = Object.keys(this.inputs);
		for (var i = 0; i < Math.min(arguments.length, keys.length); ++i) {
			this.inputs[keys[i]].setConstData(arguments[i]);
		}
	}

	_executeSpecial() {
		for (var name in this.inputs) {
			this.outputs[name].data = this.inputs[name].data;
		}
	}
}

class FilterNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.filter.inputs, nodesCfg.filter.outputs);
	}

	isReady() {
		var shipsPort = this.inputs[cfg.units.name];
		if (shipsPort.empty)
			return false;

		for (var name in this.inputs) {
			var inPort = this.inputs[name];
			if (!inPort.empty && (name != cfg.units.name))
				return true;
		}

		return false;
	}

	criterias() {
		var Criteria = function(fieldName, opName, value) {
			return {
				field: fieldName,
				operator: nodesCfg.filter.operators[opName],
				value: value,
				validate: function(unit) {
					return this.operator(unit[this.field], this.value);
				}
			};
		};

		var lst = [];
		for (var i in nodesCfg.filter.criterias) {
			var fieldName = nodesCfg.filter.criterias[i];
			var data = this.inputs[fieldName].data;
			var type = typeof data;
			if (data != null) {
				if ((type == "number")
						|| (type == "string")) {
					lst.push(new Criteria(fieldName, 'eq', data));

				} else if ((data.op != null)
							&& nodesCfg.filter.operators.hasOwnProperty(data.op)
							&& data.hasOwnProperty('value')) {
					lst.push(new Criteria(fieldName, data.op, data.value));

				} else {
					console.error(`Can't create criteria with parametrs op='${data.op}', value='${data.value}'!`);
				}
			}
		}

		return lst;
	}

	_executeSpecial() {
		// TODO: make byPosition criteria be an area (horizontal and vertical ranges).
		var criterias = this.criterias();
		this.outputs.ships.data = this.inputs.ships.data.filter(function(unit) {
			for (var i = 0; i < criterias.length; ++i)
				if (!criterias[i].validate(unit))
					return null;
			return unit;
		});
	}
}

class ManipulatorNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.manipulator.inputs, nodesCfg.manipulator.outputs);
	}

	_executeSpecial() {
		var name = this.inputs.operation.data;
		var op = nodesCfg.manipulator.operations[name];
		if (op == null)
			return console.error(`Undefined operation: ${name}!`);

		this.outputs.ships.data = op(this.inputs.left.data, this.inputs.right.data);
	}
}

class ConditionalNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.conditional.inputs, nodesCfg.conditional.outputs);
	}

	_executeSpecial() {
		var name = this.inputs.operator.data;
		if (nodesCfg.conditional.operators.hasOwnProperty(name)) {
			var op = nodesCfg.conditional.operators[name];
			this.outputs.result.data = op(this.inputs.left.data, this.inputs.right.data);
		} else {
			return console.error(`Can't use undefined operator '${name}'!`);
		}
	}
}

class ForkNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.fork.inputs, nodesCfg.fork.outputs);
		this[nodesCfg.fork.trueField] = {};
		this[nodesCfg.fork.falseField] = {};
		for (var name of nodesCfg.fork.passing) {
			this[nodesCfg.fork.trueField][name] = this.outputs[nodesCfg.fork.trueField+'_'+name];
			this[nodesCfg.fork.falseField][name] = this.outputs[nodesCfg.fork.falseField+'_'+name]
		}
	}

	getOutput(field) {
		if (this.inputs.result.data) {
			return this[nodesCfg.fork.trueField][field];
		} else {
			return this[nodesCfg.fork.falseField][field];
		}
	}

	_executeSpecial() {
		this.refreshOutputs();
		for (var i in nodesCfg.fork.passing) {
			var name = nodesCfg.fork.passing[i];
			this.getOutput(name).data = this.inputs[name].data;
		}
	}
}


// --------------------------- Units Cmds --------------------------- //

class FireCmdNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.cmdFire.inputs, nodesCfg.cmdFire.outputs);
	}

	setValue(field, value) {
		console.error(`${this.name} node has not constant input values!`);
		return this;
	}

	_executeSpecial() {
		console.log(`Order: ${this.inputs.own.data} to shoot to ${this.inputs.enemies}.`);
		// TODO: Check if units are self.
		// TODO: Check if targets are enemies.

		// TODO: Count total fire points.
		// TODO: Choose damaging targets.
		// TODO: Spread fire points between targets.
	}
}

class HoldCmdNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.cmdHold.inputs, nodesCfg.cmdHold.outputs);
	}

	setValue(field, value) {
		console.error(`${this.name} node has not constant input values!`);
		return this;
	}

	_executeSpecial() {
		console.log(`Order: ${this.inputs.own.data} to hold their positions.`);
		// TODO: Check if units are self.
		// TODO: For each own unit call onHold()
	}
}

class MoveCmdNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.cmdMove.inputs, nodesCfg.cmdMove.outputs);
	}

	setValue(field, value) {
		console.error(`${this.name} node has not constant input values!`);
		return this;
	}

	_executeSpecial() {
		console.log(`Order: ${this.inputs.own.data} to fly to ${this.inputs.position}.`);
		// TODO: Check if units are self.
		// TODO: For each own unit move by offset or to position.
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


module.exports = {
	Root: RootNode,
	Filter: FilterNode,
	Manipulator: ManipulatorNode,
	Conditional: ConditionalNode,
	Fork: ForkNode,

	CmdFire: FireCmdNode,
	CmdHold: HoldCmdNode,
	CmdMove: MoveCmdNode,

	factory: nodeFactory
};
