"use strict"

var Base = require('./base');
var nodesCfg = require('../core/config').engine.nodes;


// --------------------------- Logical Nodes --------------------------- //

class RootNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.root.inputs, nodesCfg.root.outputs);
	}

	initData() {
		var keys = Object.keys(this.inputs);
		for (var i = 0; i < Math.min(arguments.length, keys.length); ++i) {
			this.inputs[keys[i]] = arguments[i];
		}
	}

	_executeSpecial() {
		for (var name in this.inputs) {
			this.outputs[name] = this.inputs[name];
		}
	}
}

class FilterNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.filter.inputs, nodesCfg.filter.outputs);
	}

	isReady() {
		for (var name in this.inputs) {
			var inPort = this.inputs[name];
			if (!inPort.isEmpty() && (inPort.name != cfg.units.titleing.name))
				return true;
		}

		return false;
	}

	criterias() {
		var lst = [];
		for (var i in nodesCfg.filter.criterias) {
			var fieldName = nodesCfg.filter.criterias[i];
			var data = this.inputs[fieldName].data;
			var type = typeof data;
			if (data != null) {
				if ((type == "number") || (type == "string")) {
					lst.push(function(unit){ return cfg.operators.eq(unit[fieldName], data); });

				} else if ((data.op != null) && cfg.operators.hasOwnProperty(data.op)) {
					var op = cfg.operators[data.op];
					if (data.hasOwnProperty('value')) {
						lst.push(function(unit){ return op(unit[fieldName], data.value); });
					} else {
						console.error(`Invalid criteria arguments: ${data}, must have 'value' field!`);
					}

				} else {
					console.error(`Can't create criteria with undefined operator '${data.op}'!`);
				}
			}
		}

		return lst;
	}

	_executeSpecial() {
		// TODO: make byPosition criteria be an area (horizontal and vertical ranges).
		this.outputs.units = [];
		var criterias = this.criterias();

		var valid;
		for (var i in this.inputs.units) {
			var unit = this.inputs.units[i];

			// TODO: Use map instead.
			valid = true;
			for (var i in criterias) {
				var criteria = criterias[i];
				valid = valid && criteria(unit);
			}

			if (valid)
				this.outputs.units.push(unit);
		}
	}
}

class ManipulatorNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.manipulator.inputs, nodesCfg.manipulator.outputs);
	}

	_executeSpecial() {
		var name = this.inputs.operation.data;
		var op = this.operations[name];
		if (op == null)
			return console.error(`Undefined operation: ${name}!`);

		this.outputs.units.data = op(this.inputs.left.data, this.inputs.right.data);
	}
}

class ConditionalNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.conditional.inputs, nodesCfg.conditional.outputs);
	}

	_executeSpecial() {
		var result = false;
		var name = this.inputs.operator.data;
		if (cfg.operators.hasOwnProperty(name)) {
			var op = cfg.operators[name];
			result = op(this.inputs.left.data, this.inputs.right.data);
		} else {
			console.error(`Can't use undefined operator '${name}'!`);
		}

		this.outputs.data = result;
	}
}

class ForkNode extends Base.Node {
	constructor(id, name) {
		super(id, name, nodesCfg.fork.inputs, nodesCfg.fork.outputs);
		this[nodesCfg.fork.trueField] = {};
		this[nodesCfg.fork.falseField] = {};
		for (var name of nodesCfg.fork.passing) {
			this[nodesCfg.fork.trueField] = this.outputs[nodesCfg.fork.trueField+'_'+name];
			this[nodesCfg.fork.falseField] = this.outputs[nodesCfg.fork.falseField+'_'+name]
		}
	}

	onResult(result, field) {
		if (result) {
			return this.onTrue(field);
		} else {
			return this.onFalse(field);
		}
	}

	onTrue(field) {
		return this[nodesCfg.fork.trueField][field];
	}

	onFalse(field) {
		return this[nodesCfg.fork.trueField][field];
	}

	_executeSpecial() {
		var outputSelector;
		if (this.inputs.result.data) {
			outputSelector = this.onTrue;
		} else {
			outputSelector = this.onFalse;
		}

		for (var i in nodesCfg.fork.passing) {
			var name = nodesCfg.fork.passing[i];
			outputSelector(name) = this.inputs[name].data;
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
	Node: Base.Node,
	Root: RootNode,
	Filter: FilterNode,
	Manipulator: ManipulatorNode,
	Conditional: ConditionalNode,
	Fork: ForkNode,
	CmdFire: FireCmdNode,
	CmdHold: HoldCmdNode,
	CmdMove: MoveCmdNode,
	factory: nodeFactory,
	config: nodesCfg,
};
