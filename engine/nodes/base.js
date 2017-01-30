"use strict"

var Structs = require('../common/structs');
var nodesCfg = require('../config').engine.nodes;


class Port {
	constructor(id, name, holder) {
		this.id = id;
		this.name = name;
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
		if ((port == null) || (port == this) || this.isLinked(port))
			return;

		this.constant = false;
		this.children.push(port);
		port.parents.push(this);
	}

	unlink(port) {
		if ((port == null) || (port == this) || !this.isLinked(port))
			return;

		this.children.splice(this.children.indexOf(port), 1);
		port.parents.splice(port.parents.indexOf(this), 1);
	}

	clean() {
		if (this.constant)
			return;

		this.data = null;
		this.empty = true;
	}

	setConstData(value) {
		this.data = value;
		this.empty = false;
		this.constant = true;
	}

	receiveData(data) {
		if (this.empty && !this.constant) {
			this.data = data;
			this.empty = false;
		}
	}

	pushData() {
		if (this.data == null)
			return;

		for (var i = 0; i < this.children.length; ++i) {
			this.children[i].receiveData(this.data);
		}
	}
}


class Node {
 	constructor(id, name, inFields, outFields) {
		this.id = id;
		this.name = name;
		this.inputs = {};
		this.outputs = {};

		for (var i in inFields) {
			var field = inFields[i];
			this.inputs[field] = new Port(i, field, this);
		}
		for (var i in outFields) {
			var field = outFields[i];
			this.outputs[field] = new Port(i, field, this);
		}

		// console.log(`<Node:${id}:${name} (ins: [${inFields}], outs: [${outFields}])> created.`);
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
		var type = typeof port;
		var keys = Object.keys(this.inputs);

		if ((type == "number") && (port < keys.length)) {
			return this.inputs[keys[port]];
		} else if ((type == "string") && this.inputs.hasOwnProperty(port)) {
			return	this.inputs[port];
		}

		console.error(`${this.name} node has not '${port}' input port!`);
		return null;
	}

	getOutPort(port) {
		var type = typeof port;
		var keys = Object.keys(this.outputs);

		if ((type == "number") && (port < keys.length)) {
			return this.outputs[keys[port]];
		} else if ((type == "string") && this.outputs.hasOwnProperty(port)) {
			return	this.outputs[port];
		}

		console.error(`${this.name} node has not '${port}' output port!`);
		return null;
	}

	getValues() {
		var lst = [];
		for (var name in this.inputs) {
			var data = this.inputs[name].data;
			if (data == null)
				data = 0;
			lst.push(data);
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

		outPort.link(inPort);
		return true;
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

		outPort.unlink(inPort);
		return true;
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

		// this.refreshOutputs();
		this._executeSpecial();
		// this.refreshInputs();
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
	config: nodesCfg
};
