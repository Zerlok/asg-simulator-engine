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


function getTreeHierarchyListFrom(rootNode) {
	var l = 0;
	var levels = [[rootNode]]; // TODO: REWRITE!

	// While have unfinished level (finished level means each node at last level hasn't got children nodes).
	while (l < levels.length) {
		// Looking through current level.
		for (var i in levels[l]) {
			var level = levels[l];
			var node = level[i];
			var children = node.children();

			// If node has children, then current level is not finished (is not last).
			if (children.length > 0) {
				if (l+1 == level.length) { // Add next level if required.
					level.push([]);
				}
				var nextLevel = level[l+1];

				// For each child of current node.
				for (var c in children) {
					var child = children[c];

					// Check if child is not at next level.
					if (nextLevel.indexOf(child) == -1) {
						nextLevel.push(child); // Save child at next level.
						for (var badL = l; badL >= 0; --badL) { // Check child and remove from earlier levels.
							var badIdx = levels[badL].indexOf(child);
							if (badIdx != -1)
								levels[l].splice(badIdx, 1);
						}

					} // endif new child node.
				} // endfor children.
			} // endif has children.
		} // endfor node in current level.
		++l;
	} // endwhile has unfinished level.

	return levels;
}


module.exports = {
	Port: Port,
	Node: Node,
	getTHL: getTreeHierarchyListFrom
};
