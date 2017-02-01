"use strict"

var Nodes = require('./nodes');

var filename = "./strategies/tmp.txt";
var ed = new Nodes.Editor(true);


function createStrategy(filename) {
	// 0 - root created by default.
	ed.createNode('filter').setValue('type', 'fighter');
	ed.createNode('cmdFire');
	ed.link(0, 'ships', 1, 'ships');
	ed.link(1, 'ships', 2, 'ships');

	ed.createNode('filter').setValue('hull', {'op': 'le', 'value': 40});
	ed.createNode('cmdHold');
	ed.link(0, 'ships', 3, 'ships');
	ed.link(3, 'ships', 4, 'ships');

	ed.createNode('filter').setValue('side', 'own').setValue('type', 'demolisher');
	ed.createNode('filter').setValue('side', 'enemies').setValue('type', 'demolisher');
	ed.createNode('conditional').setValue('operator', 'gt');
	ed.createNode('manipulator').setValue('operation', 'union');
	ed.createNode('fork'); // 9
	ed.createNode('cmdHold');
	ed.createNode('cmdFire');
	ed.link(0, 'ships', 5, 'ships');
	ed.link(0, 'ships', 6, 'ships');
	ed.link(5, 'ships', 7, 'leftValue');
	ed.link(6, 'ships', 7, 'rightValue');
	ed.link(7, 'resultValue', 9, 'result');
	ed.link(5, 'ships', 8, 'leftSet');
	ed.link(6, 'ships', 8, 'rightSet');
	ed.link(8, 'resultSet', 9, 'ships');
	ed.link(9, 'onTrue_ships', 10, 'ships');
	ed.link(9, 'onFalse_ships', 11, 'ships');
}


// createStrategy(filename);
// ed.save(filename);
ed.load(filename);
console.log('-------------------------------------------------------------------');
ed.showNodes();
