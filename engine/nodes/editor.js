"use strict"

var fs = require('fs');
var Nodes = require('./specials');
Nodes.io = require('./io');


class NodeEditor {
	constructor() {
		this.cntr = 0;
		this.nodes = [];
		this.createNode('root');
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

	createNode(name) {
		var args = [this.cntr, name];
		for (var i = 1; i < arguments.length; ++i)
			args.push(arguments[i]);

		var node = Nodes.factory.createArgs(name, args);
		if (node == null)
			return console.error(`Failed to create a node '${name}' with arguments: [${arguments}]!`);

		this.nodes.push(node);
		++this.cntr;
		console.log(`Node ${node.name}-${node.id} created successfuly.`);
		return node;
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
		return true;
	}

	getNode(idx) {
		if (idx < 0)
			idx = this.nodes.length + idx;

		return this.nodes[idx];
	}

	setNode(idx, field, value) {
		var node = this.getNode(idx);
		if (node == null)
			return console.error(`Node ${idx} was not found!`);

		return node.setValue(field, value);
	}

	link(outNodeNum, output, inNodeNum, input) {
		var outNode = this.getNode(outNodeNum);
		var inNode = this.getNode(inNodeNum);

		if (outNode == null)
			return console.error(`Output node ${outNodeNum} was not found!`);

		if (inNode == null)
			return console.error(`Input node ${inNodeNum} was not found!`);

		if (outNode.link(output, inNode, input))
			console.log(`'${outNode.name}:${output}' output port attached to '${inNode.name}:${input}' input port.`);

		return true;
	}

	unlink(outNodeNum, output, inNodeNum, input) {
		var outNode = this.getNode(outNodeNum);
		var inNode = this.getNode(inNodeNum);

		if (outNode == null)
			return console.error(`Output node ${outNodeNum} was not found!`);

		if (inNode == null)
			return console.error(`Input node ${inNodeNum} was not found!`);

		if (outNode.unlink(output, inNode, input))
			console.log(`${outNode.name}.${output} output port deattached from ${inNode.name}.${input} input port.`);

		return true;
	}

	validate() {
		var result = Nodes.base.isCircular(this.nodes[0]);
		if (!result)
			console.log('All nodes are valid.');
		else
			console.warn('Nodes structure has loops!');
	}

	showNode(idx) {
		var node = this.getNode(idx);
		if (node == null)
			return console.error(`Can't show ${idx} node!`);

		var ins = Object.keys(node.inputs);
		var vals = node.getValues();
		var outs = Object.keys(node.outputs);
		var children = node.getChildren().map(function(child){ return child.name + '-' + child.id; });
		var parents = node.getParents().map(function(parent){ return parent.name + '-' + parent.id });

		console.log('<node>');
		console.log(`	<name>${node.name}-${node.id}</name>`);
		console.log(`	<inputs len=${ins.length}>[${ins}]</inputs>`);
		console.log(`	<values len=${vals.length}>[${vals}]</values>`);
		console.log(`	<outputs len=${outs.length}>[${outs}]</outputs>`);
		console.log(`	<parents len=${parents.length}>[${parents}]</parents>`);
		console.log(`	<children len=${children.length}>[${children}]</children>`);
		console.log('</node>');
	}

	showNodes() {
		console.log(`Total ${this.nodes.length} nodes:`);
		this.validate();
		console.log(`Hierarchy level depth: ${Nodes.base.buildLSH(this.nodes[0]).data.length}`);
		for (var i in this.nodes) {
			this.showNode(i);
		}
	}
}


module.exports = {
	Editor: NodeEditor
}
