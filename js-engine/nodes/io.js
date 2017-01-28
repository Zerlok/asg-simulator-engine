"use strict"

var Nodes = require('./specials');

function fromJson(text) {
	var lst = [];
	if (text == null)
		return lst;

	var data = JSON.parse(text);

	for (var i in data.nodes) {
		var row = data.nodes[i];
		// row.args.splice(0, 0, row.name);
		// row.args.splice(0, 0, i);
		// var node = Nodes.factory.createArgs(row.name, args);
		var node = Nodes.factory.create(row.name, i, row.name);
		for (var f in row.ins) {
			var field = row.ins[f];
			node.inputs[field.name].data = field.data;
		}

		lst.push(node);
	}

	for (var i in data.links) {
		var row = data.links[i];
		var parentNode = lst[row.parent];
		for (var p in row.pairs) {
			var pair = row.pairs[p];
			var portName = pair.port;
			for (var c in pair.children) {
				var child = pair.children[c];
				// console.log(`Trying to link ${parentNode.name}.${portName} to ${lst[child.num].name}.${child.port}`);
				parentNode.outputs[portName].link(lst[child.num].inputs[child.port]);
			}
		}
	}

	// console.log(data.nodes);
	// console.log(data.links);
	return lst;
}

function toJson(nodeList) {
	var data = {'nodes': [], 'links': []};
	for (var i in nodeList) {
		var node = nodeList[i];
		var row = {'id': i, 'name': node.name};
		// var args = node.getArgs();
		// if (args != null)
			// row.args = args;
		var ins = [];
		for (var field in node.inputs) {
			var portData = node.inputs[field].data;
			if (portData != null) {
				ins.push({'name': field, 'data': portData});
			}
		}

		if (ins.length > 0)
			row.ins = ins;

		data.nodes.push(row);
	}

	var links = [];
	for (var i = 0; i < nodeList.length; ++i) {
		var node = nodeList[i];
		var row = {'parent': i, 'pairs': []};
		for (var name in node.outputs) {
			var outPort = node.outputs[name];
			var pair = {'port': name, 'children': []};
			for (var c in outPort.children) {
				var child = outPort.children[c];
				pair.children.push({'port': child.name, 'num': nodeList.indexOf(child.holder)})
			}

			if (pair.children.length > 0)
				row.pairs.push(pair);
		}

		if (row.pairs.length > 0)
			data.links.push(row);
	}

	// console.log(data.nodes);
	// console.log(data.links);
	return JSON.stringify(data);
}


module.exports = {
	fromJson: fromJson,
	toJson: toJson
}
