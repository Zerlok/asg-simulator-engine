"use strict"

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

	setData(value, constant) {
		this.data = value;
		this.empty = false;
		this.constant = (constant || false);
	}

	receiveData(data) {
		if (!this.empty && !this.constant) {
			this.data = data;
			this.empty = false;
		}
	}

	pushData() {
		for (var i in this.children) {
			var child = this.children[i];
			child.receiveData(this.data);
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
			if (inPort.empty())
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
				// console.log(inPort);
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

	getInPort(num) {
		var keys = Object.keys(this.inputs);
		if (keys.length <= num) {
			console.error(`${this.name} node has not ${num} input port!`);
			return null;
		}

		return this.inputs[keys[num]];
	}

	getOutPort(num) {
		var keys = Object.keys(this.outputs);
		if (keys.length <= num) {
			console.error(`${this.name} node has not ${num} output port!`);
			return null;
		}

		return this.outputs[keys[num]];
	}

	isLinked(o, i, node) {
		var outPort = this.getOutPort(o);
		var inPort = node.getInPort(i);
		if ((outPort == null) || (inPort == null))
			return false;

		return outPort.isLinked(inPort);
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

	link(o, i, node) {
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

	unlink(o, i, node) {
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

	pushData() {
		this.outputs.forEach(function(output) {
			output.pushData();
		});
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
		for (var name in this.outputs) {
			var outPort = this.outputs[name];
			outPort.pushData();
		}
	}

	_executeSpecial() {
		// Override this method in special nodes.
		console.error(`Node ${this.name} do not overrides '_executeSpecial' method!`);
	}
}


module.exports = {
	Port: Port,
	BaseNode: Node
};
