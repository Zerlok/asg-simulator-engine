"use strict"

var nodeFactory = require('./specials').factory;


function getNodeById(lst, id) {
	for (var i = 0; i < lst.length; ++i) {
		if (lst[i].id == id)
			return lst[i];
	}
	return null;
}


function fromJson(text) {
	var lst = [];
	if (text == null)
		return lst;

	var data = JSON.parse(text);

	var i, j;
	var row, node, field;
	for (i = 0; i < data.nodes.length; ++i) {
		row = data.nodes[i];
		node = nodeFactory.create(row.name, row.id);

		for (j = 0; j < row.inputs.length; ++j) {
			field = row.inputs[j];
			node.inputs[field.name].setConstData(field.data);
		}

		lst.push(node);
	}

	var k;
	var parent, pair, port, child;
	for (i = 0; i < data.links.length; ++i) {
		row = data.links[i];
		parent = getNodeById(lst, row.source.id);
		child = getNodeById(lst, row.target.id);

		if ((parent == null) || (child == null)) {
			console.error(`Link ${row} is invalid.`);
			continue;
		}

		parent.link(row.source.port, child, row.target.port);
	}

	// console.log(data.nodes);
	// console.log(data.links);
	return lst;
}


function toJson(nodeList) {
	var data = {
		'nodes': [],
		'links': []
	};

	var i, j;
	var node, row, inputs, field, portData;
	for (var i = 0; i < nodeList.length; ++i) {
		node = nodeList[i];
		row = {
			'id': node.id,
			'name': node.name,
			'inputs': []
		};

		for (field in node.inputs) {
			portData = node.inputs[field].data;
			if (portData != null) {
				row.inputs.push({
					'name': field,
					'data': portData
				});
			}
		}

		data.nodes.push(row);
	}

	var j;
	var port, pair, child, field;
	for (i = 0; i < nodeList.length; ++i) {
		node = nodeList[i];
		for (field in node.outputs) {
			port = node.outputs[field];
			for (j = 0; j < port.children.length; ++j) {
				child = port.children[j];
				data.links.push({
					'source': {
						'id': node.id,
						'port': port.name
					},
					'target': {
						'id': child.holder.id,
						'port': child.name
					}
				});
			}
		}
	}

	// console.log(data.nodes);
	// console.log(data.links);
	return JSON.stringify(data);
}


module.exports = {
	fromJson: fromJson,
	toJson: toJson,
}
