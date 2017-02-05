"use strict"

var Structs = require('../common/structs');
var Units = require('../units');
var cfg = require('../config').engine;


class Port {
	constructor(id, field, holder) {
		this.id = id;
		this.name = field.name;
		this.type = field.type;
		this.holder = holder;
		this.data = null;
		this.empty = true;
		this.constant = false;
		this.children = [];
		this.parents = [];
	}

	isLinked(port) {
		return (this.children.indexOf(port) != -1);
	}

	link(port) {
		if ((port == null)
				|| (port == this)
				|| (port.type != this.type)
				|| this.isLinked(port))
			return false;

		this.constant = false;
		this.children.push(port);
		port.constant = false;
		port.parents.push(this);
		return true;
	}

	unlink(port) {
		if ((port == null)
				|| (port == this)
				|| !this.isLinked(port))
			return false;

		this.children.splice(this.children.indexOf(port), 1);
		port.parents.splice(port.parents.indexOf(this), 1);
		return true;
	}

	clean() {
		if (this.constant)
			return false;

		this.data = null;
		this.empty = true;
		return true;
	}

	setConstData(value) {
		this.data = value;
		this.empty = (value == null);
		this.constant = (value != null);
	}

	receiveData(data) {
		if (!this.empty || this.constant)
			return false;

		this.data = data;
		this.empty = (data == null);
		return true;
	}

	pushData() {
		if (this.data == null)
			return false;

		for (var i = 0; i < this.children.length; ++i) {
			this.children[i].receiveData(this.data);
		}
		return true;
	}
}


class Node {
 	constructor(id, name, type, inFields, outFields) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.inputs = {};
		this.outputs = {};

		var i;
		for (i = 0; i < inFields.length; ++i) {
			var field = inFields[i];
			this.inputs[field.name] = new Port(i, field, this);
		}
		for (i = 0; i < outFields.length; ++i) {
			var field = outFields[i];
			this.outputs[field.name] = new Port(i, field, this);
		}
		// console.log(`<Node:${id}:${name} (ins: [${inFields}], outs: [${outFields}])> created.`);
		// console.log(this.inputs);
		// console.log(this.outputs);
	}

	isReady() {
		for (var name in this.inputs) {
			var inPort = this.inputs[name];
			if (inPort.empty)
				return false;
		}
		return true;
	}

	getChildren() {
		var lst = [];
		for (var name in this.outputs) {
			var outPort = this.outputs[name];
			for (var i in outPort.children) {
				var inPort = outPort.children[i];
				if (lst.indexOf(inPort.holder) == -1) {
					lst.push(inPort.holder);
				}
			}
		}
		return lst;
	}

	getParents() {
		var lst = [];
		for (var name in this.inputs) {
			var inPort = this.inputs[name];
			for (var i in inPort.parents) {
				var outPort = inPort.parents[i];
				if (lst.indexOf(outPort.holder) == -1) {
					lst.push(outPort.holder);
				}
			}
		}
		return lst;
	}

	getInPort(port) {
		if (!this.inputs.hasOwnProperty(port)) {
			console.error(`${this.name} node has not '${port}' input port!`);
			return null;
		}

		return	this.inputs[port];
	}

	getOutPort(port) {
		if (!this.outputs.hasOwnProperty(port)) {
			console.error(`${this.name} node has not '${port}' output port!`);
			return null;
		}

		return	this.outputs[port];
	}

	getValues() {
		var lst = [];
		var input;
		for (var name in this.inputs) {
			input = this.inputs[name].data;
			if ((input == null)
					|| (!input.hasOwnProperty(cfg.units.self)
						&& !input.hasOwnProperty(cfg.units.enemy))) {
				lst.push(input || "none");
			} else {
				lst.push(`${input[cfg.units.self].length} + ${input[cfg.units.enemy].length}`);
			}
		}
		return lst;
	}

	getResults() {
		var lst = [];
		var output;
		for (var name in this.outputs) {
			output = this.outputs[name].data;
			if ((output == null)
					|| (!output.hasOwnProperty(cfg.units.self)
						&& !output.hasOwnProperty(cfg.units.enemy))) {
				lst.push(output || "none");
			} else {
				lst.push(`${output[cfg.units.self].length} + ${output[cfg.units.enemy].length}`);
			}
		}
		return lst;
	}

	isParentOf(node) {
		for (var name in this.outputs) {
			var outPort = this.outputs[name];
			for (var i in outPort.children) {
				var inPort = outPort.children[i];
				if (inPort.holder == node) {
					return true;
				}
			}
		}
		return false;
	}

	isChildOf(node) {
		return node.isParentOf(this);
	}

	link(o, node, i) {
		if ((node == null) || (node == this))
			return false;

		var outPort = this.getOutPort(o);
		var inPort = node.getInPort(i);
		if ((outPort == null)
				|| (inPort == null)
				|| (outPort.isLinked(inPort)))
			return false;

		return outPort.link(inPort);
	}

	unlink(o, node, i) {
		if ((node == null) || (node == this))
			return false;

		var outPort = this.getOutPort(o);
		var inPort = node.getInPort(i);
		if ((outPort == null)
				|| (inPort == null)
				|| (!outPort.isLinked(inPort)))
			return false;

		return outPort.unlink(inPort);
	}

	setValue(field, value) {
		var port = this.getInPort(field);
		if (port == null)
			return this;

		port.setConstData(value);
		return this;
	}

	pushData() {
		for (var name in this.outputs) {
			this.outputs[name].pushData();
		}
	}

	refreshInputs() {
		for (var name in this.inputs) {
			this.inputs[name].clean();
		}
	}

	refreshOutputs() {
		for (var name in this.outputs) {
			this.outputs[name].clean();
		}
	}

	refresh() {
		this.refreshInputs();
		this.refreshOutputs();
	}

	execute() {
		if (!this.isReady())
			return console.error(`Node ${this.name} is not ready for executeion!`);

		this._executeSpecial();
		this.pushData();
	}

	_executeSpecial() {
		// Override this method in special nodes.
		console.error(`Node ${this.name} do not overrides '_executeSpecial' method!`);
	}
}


function hasCircularLinks(rootNode) {
	var iterators = {
		fast: new Structs.Iterator(rootNode, 1),
		slow: new Structs.Iterator(rootNode, 2)
	};
	var it;
	var node;
	var children, i;

	iterators.fast.next();
	iterators.fast.queue = rootNode.getChildren();

	while (!iterators.fast.equals(iterators.slow)) {
		for (var type in iterators) {
			it = iterators[type];
			node = it.next();
			if (node == null)
				continue;

			children = node.getChildren();
			for (i = 0; i < children.length; ++i) {
				it.uniquePush(children[i]);
			}
		}
	}

	return (iterators.fast.queue.length > 0);
}


function buildLevelSortedTree(rootNode) {
	var tree = new Structs.LevelContainer(rootNode);
	var queue = [rootNode];
	var node, pos;
	var children, i, child, childPos;

	while (queue.length > 0) {
		node = queue.splice(0, 1)[0];
		pos = tree.find(node);
		children = node.getChildren();
		for (i = 0; i < children.length; ++i) {
			child = children[i];
			childPos = tree.find(child);
			if (childPos.level <= pos.level) {
				tree.remove(childPos);
				tree.insert(pos.level+1, child);
				if (queue.indexOf(child) == -1)
					queue.push(child);
			}
		}
	}

	return tree;
}


module.exports = {
	Port: Port,
	Node: Node,
	isCircular: hasCircularLinks,
	buildLST: buildLevelSortedTree,
	config: cfg.nodes
};
