"use strict"

var Nodes = require('./nodes');

var filename = "./strategies/tmp.txt";
var ed = new Nodes.Editor(true);


function createStrategy(filename) {
	// 0 - root created by default.
	ed.createNode('filter').setValue('type', 'fighter');
	ed.createNode('filter').setValue('type', 'fighter');
	ed.createNode('cmdFire');
	ed.link(0, 'own', 1, 'ships');
	ed.link(0, 'enemies', 2, 'ships');
	ed.link(1, 'ships', 3, 'own');
	ed.link(2, 'ships', 3, 'enemies');

	ed.createNode('filter').setValue('health', {'op': 'le', 'value': 40});
	ed.createNode('cmdHold');
	ed.link(0, 'own', 4, 'ships');
	ed.link(4, 'ships', 5, 'own');

	ed.createNode('filter').setValue('type', 'demolisher');
	ed.createNode('filter').setValue('type', 'demolisher');
	ed.createNode('conditional').setValue('operator', 'gt');
	ed.createNode('fork'); // 9
	ed.createNode('cmdHold');
	ed.createNode('cmdFire');
	ed.link(0, 'own', 6, 'ships');
	ed.link(0, 'enemies', 7, 'ships');
	ed.link(6, 'ships', 8, 'left');
	ed.link(7, 'ships', 8, 'right');
	ed.link(8, 'result', 9, 'result');
	ed.link(6, 'ships', 9, 'own');
	ed.link(7, 'ships', 9, 'enemies');
	ed.link(9, 'onTrue_own', 10, 'own');
	ed.link(9, 'onFalse_own', 11, 'own');
	ed.link(9, 'onFalse_enemies', 11, 'enemies');
}


// createStrategy(filename);
// ed.save(filename);
ed.load(filename);
console.log('-------------------------------------------------------------------');
ed.showNodes();
