"use strict"

var Nodes = require('./nodes/specials');
Nodes.io = require('./nodes/io');
Nodes.Editor = require('./nodes/editor').Editor;


var filename = "./strategy.txt";
var neditor = new Nodes.Editor();

// neditor.createNode('filter', ['byHealth', 'byShields', 'byPosition']);
// neditor.createNode('cmd-fire');
// neditor.link(0, 0, 1, 0);
// neditor.save(filename);

neditor.load(filename);


var nodes = neditor.nodes;
console.log(nodes[0]);
console.log(nodes[1]);
console.log(nodes[0].isParentOf(nodes[1]));
console.log(nodes[0].isChildOf(nodes[1]));
console.log(nodes[1].id);
console.log(nodes[1].getOutPort(0).holder.id);
