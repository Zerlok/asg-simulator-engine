"use strict"

var Node = require('./node');
var nodesCfg = require('../core/config').engine.nodes;


// --------------------------- Logical Nodes --------------------------- //

class RootNode extends Node.BaseNode {
	constructor(id, name) {
		super(id, name, nodesCfg.root.inputs, nodesCfg.root.outputs);
	}

	get isReady() { return true; }

	setData() {
		var keys = Object.keys(this.inputs);
		for (var i = 0; i < min(arguments.length, keys.length); ++i) {
			this.inputs[keys[i]] = arguments[i];
		}
	}

	_executeSpecial() {
		for (var name in this.inputs) {
			this.outputs[name] = this.inputs[name];
		}
	}
}

class FilterNode extends Node.BaseNode {
	constructor(id, name) {
		super(id, name, nodesCfg.filter.inputs, nodesCfg.filter.outputs);
	}

	get isReady() {
		for (var name in this.inputs) {
			var inPort = this.inputs[name];
			if (!inPort.isEmpty() && (inPort.name != cfg.units.titleing.name))
				return true;
		}

		return false;
	}

	get criterias() {
		var lst = [];
		for (var i in nodesCfg.filter.criterias) {
			var name = nodesCfg.filter.criterias[i];
			var data = this.inputs[name].data;
			if (data != null) {
				if (cfg.operators.hasOwnProperty(data.op)) {
					var op = cfg.operators[data.op];
					if (data.hasOwnProperty('right')) {
						lst.push(function(unit){ return op(unit[data.field], data.right); });
					} else if (data.hasOwnProperty('left')) {
						lst.push(function(unit){ return op(data.left, unit[data.field]); });
					} else {
						console.error(`Invalid criteria arguments: ${data}, must have either 'left' or 'right' field!`);
					}
				} else {
					console.error(`Can't create criteria with undefined operator '${data.opName}'!`);
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

class ManipulatorNode extends Node.BaseNode {
	constructor(id, name) {
		super(id, name, nodesCfg.manipulator.inputs, nodesCfg.manipulator.outputs);
	}

	_executeSpecial() {
		// TODO: Check if can gain an access to private fields/methods (_executeSpecial for example).
		var name = this.inputs.operation.data;
		var op = this['_'+name];
		if (op == null)
			return console.error(`Undefined operation: ${name}!`);

		this.outputs.units.data = op(this.inputs.left.data, this.inputs.right.data);
	}

	_intersection(a, b) {
		var result = [];
		for (var i in a) {
			var unit = a[i];
			if (b.indexOf(unit) != -1)
				result.push(unit);
		}

		return result;
	}

	_union(a, b) {
		var result = [];
		for (var i in a) {
			var unit = a[i];
			result.push(unit);
		}
		for (var i in b) {
			var unit = b[i];
			if (a.indexOf(unit) == -1)
				result.push(unit);
		}

		return result;
	}

	_difference(a, b) {
		var result = [];
		for (var i in a) {
			var unit = a[i];
			if (b.indexOf(unit) == -1)
				result.push(unit);
		}

		return result;
	}
}

class ConditionalNode extends Node.BaseNode {
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

class ForkNode extends Node.BaseNode {
	constructor(id, name) {
		super(id, name, nodesCfg.fork.inputs, nodesCfg.fork.outputs);
	}

	_executeSpecial() {
		var str;
		if (this.inputs.result.data) {
			str = 'onTrue_';
		} else {
			str = 'onFalse_';
		}

		for (var i in nodesCfg.fork.passing) {
			var name = nodesCfg.fork.passing[i];
			this.inputs[name].data = this.outputs[str+name];
		}
	}
}


// --------------------------- Units Cmds --------------------------- //

class FireCmdNode extends Node.BaseNode {
	constructor(id, name) {
		super(id, name, nodesCfg.cmdFire.inputs, nodesCfg.cmdFire.outputs);
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

class HoldCmdNode extends Node.BaseNode {
	constructor(id, name) {
		super(id, name, nodesCfg.cmdHold.inputs, nodesCfg.cmdHold.outputs);
	}

	_executeSpecial() {
		console.log(`Order: ${this.inputs.own.data} to hold their positions.`);
		// TODO: Check if units are self.
		// TODO: For each own unit call onHold()
	}
}

class MoveCmdNode extends Node.BaseNode {
	constructor(id, name) {
		super(id, name, nodesCfg.cmdMove.inputs, nodesCfg.cmdMove.outputs);
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
nodeFactory.registrate('condition', ConditionalNode);
nodeFactory.registrate('fork', ForkNode);
nodeFactory.registrate('cmdFire', FireCmdNode);
nodeFactory.registrate('cmdHold', HoldCmdNode);
nodeFactory.registrate('cmdMove', MoveCmdNode);


module.exports = {
	Node: Node.BaseNode,
	Root: RootNode,
	Filter: FilterNode,
	Manipulator: ManipulatorNode,
	Condition: ConditionalNode,
	Fork: ForkNode,
	CmdFire: FireCmdNode,
	CmdHold: HoldCmdNode,
	CmdMove: MoveCmdNode,
	factory: nodeFactory,
	config: nodesCfg,
};
