"use strict"

var fs = require('fs');
var Nodes = require('./specials');
Nodes.io = require('./io');


class NodeEditor {
	constructor() {
		this.nodeCntr = 0;
		this.nodes = [];
		this.createNode('root');
	}

	createNode(name) {
		var args = [this.nodeCntr, name];
		for (var i = 1; i < arguments.length; ++i)
			args.push(arguments[i]);

		var node = Nodes.factory.createArgs(name, args);
		if (node == null)
			return console.error(`Failed to create a node '${name}' with arguments: [${arguments}]!`);

		this.nodes.push(node);
		++this.nodeCntr;
		console.log(`Node ${node.name} created successfuly.`);
	}

	removeNode(idx) {
		var node = getNode(idx);
		if (node == null)
			return console.error(`Can't delete undefined node (${idx})!`);

		for (var name in node.inputs) {
			var inPort = node.inputs[name];
			for (var i in inPort.parents) {
				var outPort = inPort.parents[i];
				outPort.unlink(inPort);
			}
		}
		for (var name in node.outputs) {
			var outPort = node.outputs[name];
			for (var i in outPort.children) {
				var inPort = outPort.children[i];
				outPort.unlink(inPort);
			}
		}

		var parents = node.parents();
		var children = node.children();
		if ((parents.length != 0) || (children.length != 0))
			return console.error(`Node ${node.name} still has ${parents} as parents and ${children} as children!`);

		this.nodes.splice(idx, 1);
		// delete node; // FIXME: can't delete in strict mode.
		console.log(`Node ${node.name} removed successfuly.`);
	}

	getNode(idx) {
		if (idx < 0)
			idx = this.nodes.length + idx;

		return this.nodes[idx];
	}

	save(filename) {
		fs.writeFile(filename, Nodes.io.toJson(this.nodes), function(err) {
			if (err) return console.error(`Caught an error: ${err} while writing into '${filename}' file!`);
		});
		console.log(`Nodes were written into ${filename} successfuly.`);
	}

	load(filename) {
		var text = fs.readFileSync(filename, 'utf8', function(err, d) {
			if (err) return console.error(`Caught an error: ${err} while reading '${filename}' file!`);
		});
		this.nodes = Nodes.io.fromJson(text);
		console.log(`Nodes were loaded from ${filename} successfuly.`);
	}

	link(outNodeNum, outPortNum, inNodeNum, inPortNum) {
		var outNode = this.getNode(outNodeNum);
		var inNode = this.getNode(inNodeNum);

		if (outNode == null)
			return console.error('Output node is undefined!');

		if (inNode == null)
			return console.error('Input node is undefined!');

		if (outNode.link(outPortNum, inPortNum, inNode))
			console.log(`${outNode.name}.${outPortNum} output port attached to ${inNode.name}.${inPortNum} input port.`);
	}

	unlink(outNodeNum, outPortNum, inNodeNum, inPortNum) {
		var outNode = this.getNode(outNodeNum);
		var inNode = this.getNode(inNodeNum);

		if (outNode == null)
			return console.error('Output node is undefined!');

		if (inNode == null)
			return console.error('Input node is undefined!');

		if (outNode.unlink(outPortNum, inPortNum, inNode))
			console.log(`${outNode.name}.${outPortNum} output port deattached from ${inNode.name}.${inPortNum} input port.`);
	}

	showNode(idx) {
		var node = this.getNode(idx);
		if (node == null)
			return console.error(`Can't show ${idx} node!`);

		var ins = Object.keys(node.inputs);
		var outs = Object.keys(node.outputs);
		var children = node.getChildren().map(function(child){ return child.name + '-' + child.id; });
		var parents = node.getParents().map(function(parent){ return parent.name + '-' + parent.id });

		console.log('------------------------ EDITOR OUTPUT ------------------------');
		console.log(`Node(${node.name}-${node.id}), ins(${ins.length}): [${ins}], outs(${outs.length}): [${outs}]`);
		console.log(`Receives inputs from [${parents}]`);
		console.log(`Pushes outputs to [${children}]`);
	}

	showNodes() {
		console.log('------------------------ EDITOR OUTPUT ------------------------');
		console.log(`Total ${this.nodes.length} nodes:`);
		for (var i in this.nodes) {
			var node = this.nodes[i];
			var ins = Object.keys(node.inputs);
			var outs = Object.keys(node.outputs);
			console.log(`Node(${node.name}-${node.id}), ins(${ins.length}): [${ins}], outs(${outs.length}): [${outs}]`);
		}
	}
}


module.exports = {
	Editor: NodeEditor
}
