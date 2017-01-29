"use strict"

var Nodes = require('./nodes/specials');
Nodes.io = require('./nodes/io');
Nodes.Editor = require('./nodes/editor').Editor;


var filename = "./strategy.txt";
var neditor = new Nodes.Editor();


function createStrategy(filename) {
	// 0 - root created by default.
	neditor.createNode('filter').setValue('type', 'fighter');
	neditor.createNode('filter').setValue('type', 'fighter');
	neditor.createNode('cmdFire');
	neditor.link(0, 'own', 1, 'ships');
	neditor.link(0, 'enemies', 2, 'ships');
	neditor.link(1, 'ships', 3, 'own');
	neditor.link(2, 'ships', 3, 'enemies');

	neditor.createNode('filter').setValue('health', {'op': 'le', 'value': 40});
	neditor.createNode('cmdHold');
	neditor.link(0, 'own', 4, 'ships');
	neditor.link(4, 'ships', 5, 'own');

	neditor.createNode('filter').setValue('type', 'demolisher');
	neditor.createNode('filter').setValue('type', 'demolisher');
	neditor.createNode('conditional').setValue('operator', 'gt');
	neditor.createNode('fork'); // 9
	neditor.createNode('cmdHold');
	neditor.createNode('cmdFire');
	neditor.link(0, 'own', 6, 'ships');
	neditor.link(0, 'enemies', 7, 'ships');
	neditor.link(6, 'ships', 8, 'left');
	neditor.link(7, 'ships', 8, 'right');
	neditor.link(8, 'result', 9, 'result');
	neditor.link(6, 'ships', 9, 'own');
	neditor.link(7, 'ships', 9, 'enemies');
	neditor.link(9, 'onTrue_own', 10, 'own');
	neditor.link(9, 'onFalse_own', 11, 'own');
	neditor.link(9, 'onFalse_enemies', 11, 'enemies');
}


// createStrategy(filename);
// neditor.save(filename);
neditor.load(filename);
neditor.showNodes();
