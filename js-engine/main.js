"use strict"

var Nodes = require('./nodes/specials');
Nodes.io = require('./nodes/io');
Nodes.Editor = require('./nodes/editor').Editor;


var filename = "./strategy.txt";
var neditor = new Nodes.Editor();


function createStrategy(filename) {
	neditor.createNode('filter');
	neditor.createNode('filter');
	neditor.createNode('cmdFire');
	neditor.link(0, 0, 1, 0);
	neditor.link(0, 1, 2, 0);
	neditor.link(1, 0, 3, 0);
	neditor.link(2, 0, 3, 1);

	neditor.createNode('filter');
	neditor.createNode('cmdHold');
	neditor.link(0, 0, 4, 0);
	neditor.link(4, 0, 5, 0);

	neditor.save(filename);
}

function checkStrategy() {
	var nodes = neditor.nodes;
	// console.log(nodes[0]);
	console.log(nodes[1]);
	console.log(nodes[0].isParentOf(nodes[1]));
	console.log(nodes[4].isChildOf(nodes[0]));
}

createStrategy(filename);
// neditor.load(filename);

// checkStrategy();
neditor.showNodes();
neditor.showNode(2);
