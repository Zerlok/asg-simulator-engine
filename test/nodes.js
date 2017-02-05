"use strict"

var chai = require('chai');
var expect = chai.expect;

var Engine = require('../engine');

var neditor = new Engine.nodes.Editor();
var nodes = neditor.nodes;
var nodesTree, parsedNodes;


const unitsLen = 5;
var initUnits = function() {
	var units = {own: [], enemies: []};
	for (var type in Engine.units.config.types) {
		for (var i = 0; i < unitsLen; ++i) {
			units.own.push(new Engine.units.Unit(type));
			units.enemies.push(new Engine.units.Unit(type));
		}
	}
	return units;
}


// ------------------------- Custom Nodes Tests ------------------------- //

describe("Nodes custom executions:", function() {
	it("Root execution", function() {
		var units = initUnits();
		var node = new Engine.nodes.Root(0);
		expect(node.isReady()).to.be.false;

		node.initData(units.own, units.enemies, 4, "nothing");
		expect(node.isReady()).to.be.true;

		node.execute();
		expect(node.outputs.ships.data.own).to.eql(units.own);
		expect(node.outputs.ships.data.enemies).to.eql(units.own);
		expect(node.outputs.round.data).to.equal(4);
	});

	it("Filter execution", function() {
		var units = initUnits();
		var node, filtered;
		node = new Engine.nodes.Filter(0);
		expect(node.isReady()).to.be.false;

		node.inputs.ships.setConstData(units);
		node.inputs.type.setConstData('fighter');
		expect(node.isReady()).to.be.true;

		var filterfunc = function(x){ if (x.type == 'fighter') return x; };
		filtered = {
			own: units.own.filter(filterfunc),
			enemies: units.enemies.filter(filterfunc)
		};
		node.execute();
		expect(node.outputs.ships.data).to.eql(filtered);
		expect(node.outputs.amount.data).to.equal(filtered.own.length + filtered.enemies.length);

		node = new Engine.nodes.Filter(0);
		node.inputs.ships.setConstData(units);
		node.inputs.side.setConstData("enemies");
		node.inputs.hull.setConstData({'op': 'lt', 'value': 200});
		filtered = {
			own: [],
			enemies: units.enemies.filter(function(x) { if (x.hull < 200) { return x; } })
		}
		node.execute();
		expect(node.outputs.ships.data).to.eql(filtered);
		expect(node.outputs.amount.data).to.equal(filtered.enemies.length);
	});

	it("Manipulator execution", function() {
		var units = initUnits();
		var node;
		node = new Engine.nodes.Manipulator(0);
		expect(node.isReady()).to.be.false;

		node.inputs.leftSet.setConstData({own: units.own, enemies: []});
		node.inputs.rightSet.setConstData({own: [], enemies: units.enemies});
		node.inputs.operation.setConstData('union');
		node.execute();
		expect(node.outputs.resultSet.data).to.eql(units);
		expect(node.outputs.amount.data).to.equal(units.own.length + units.enemies.length);

		node.inputs.operation.setConstData('intersection');
		node.execute();
		expect(node.outputs.resultSet.data).to.eql({own: [], enemies: []});
		expect(node.outputs.amount.data).to.equal(0);
	});

	it("Conditional execution", function() {
		var units = initUnits();
		var node;
		node = new Engine.nodes.Conditional(0);
		node.inputs.leftValue.setConstData(units.own);
		node.inputs.rightValue.setConstData(200);

		node.inputs.operator.setConstData('lt');
		node.execute();
		expect(node.outputs.resultValue.data).to.be.true;

		node.inputs.operator.setConstData('eq');
		node.execute();
		expect(node.outputs.resultValue.data).to.be.false;

		node.inputs.operator.setConstData('gt');
		node.inputs.rightValue.setConstData(10);
		node.execute();
		expect(node.outputs.resultValue.data).to.be.true;
	});

	it("Fork execution", function() {
		var units = initUnits();
		var node;
		node = new Engine.nodes.Fork(0);
		node.inputs.ships.setConstData(units);

		expect(node.onTrue.ships.data).to.be.null;
		expect(node.onFalse.ships.data).to.be.null;

		node.inputs.result.setConstData(5);
		node.execute();
		expect(node.onTrue.ships.data).to.be.eql(units);
		expect(node.onFalse.ships.data).to.be.null;

		node.inputs.result.setConstData(false);
		node.execute();
		expect(node.onTrue.ships.data).to.be.null;
		expect(node.onFalse.ships.data).to.be.eql(units);
	});

	it("FireCmd execution", function() {
		var units = initUnits();
		var node = new Engine.nodes.CmdFire(0);
		node.inputs.ships.setConstData(units);

		var pointsFunc = function(unit){ return unit.hull + unit.shields; };
		var pointsBefore = {
			own: units.own.map(pointsFunc),
			enemies: units.enemies.map(pointsFunc)
		};

		node.execute();
		for (var i = 0; i < units.own.length; ++i)
			expect(pointsFunc(units.own[i])).to.equal(pointsBefore.own[i]);
		var cntr = 0;
		for (var i = 0; i < units.enemies.length; ++i)
			if (pointsFunc(units.enemies[i]) < pointsBefore.enemies[i])
				++cntr;

		expect(cntr).to.be.above(0);
	});

	it("HoldCmd execution", function() {
		var units = initUnits();
		var node = new Engine.nodes.CmdHold(0);
		node.inputs.ships.setConstData(units);

		var shieldFunc = function(unit){ return unit.shields; };
		var shieldsBefore = {
			own: units.own.map(shieldFunc),
			enemies: units.enemies.map(shieldFunc)
		};

		node.execute();
		for (var i = 0; i < units.own.length; ++i)
			expect(shieldFunc(units.own[i])).to.be.above(shieldsBefore.own[i]);
		for (var i = 0; i < units.enemies.length; ++i)
			expect(shieldFunc(units.enemies[i])).to.equal(shieldsBefore.enemies[i]);
	});

	// it("MoveCmd execution", function() {
	// 	var node;
	// 	expect(false).to.be.ok;
	// });
});


// ------------------------- Strategy Tests ------------------------- //

describe("Strategy editing and execution:", function() {
	it("Every node is registered in node factory", function() {
		for (var i in Engine.nodes.config.names) {
			var name = Engine.nodes.config.names[i];
			var node = Engine.nodes.factory.create(name, i, name);

			expect(node).to.be.ok;
			expect(node.id).to.equal(i);
			expect(node.name).to.equal(name);
		}
	});

	it("Editor creates nodes", function() {
		var node;
		node = neditor.createNode('filter').setValue('type', 'fighter');
		expect(node.name).to.equal('filter');
		expect(node.inputs.type.data).to.equal('fighter');
		expect(node.inputs.hull.data).to.be.null;

		node = neditor.createNode('cmdFire');
		expect(node.name).to.equal('cmdFire');
		expect(node.inputs.type).to.be.undefined;

		node = neditor.createNode('filter').setValue('hull', {'op': 'le', 'value': 40});
		expect(node.name).to.equal('filter');
		expect(node.inputs.type.data).to.be.null;
		expect(node.inputs.hull.data).to.eql({'op': 'le', 'value': 40});

		node = neditor.createNode('cmdHold');
		expect(node.name).to.equal('cmdHold');

		node = neditor.createNode('filter').setValue('side', 'own').setValue('type', 'demolisher');
		expect(node.name).to.equal('filter');
		expect(node.inputs.side.data).to.equal('own');
		expect(node.inputs.type.data).to.equal('demolisher');
		expect(node.inputs.hull.data).to.be.null;

		neditor.createNode('filter').setValue('side', 'enemies').setValue('type', 'demolisher');
		neditor.createNode('conditional').setValue('operator', 'gt');
		neditor.createNode('manipulator').setValue('operation', 'union');
		neditor.createNode('fork');
		neditor.createNode('cmdHold');
		neditor.createNode('cmdFire');

		expect(nodes).to.have.lengthOf(12);
	});

	it("Linking creates a directed graph structure", function() {
		neditor.link(0, 'ships', 1, 'ships');
		neditor.link(1, 'ships', 2, 'ships');
		neditor.link(0, 'ships', 3, 'ships');
		neditor.link(3, 'ships', 4, 'ships');
		neditor.link(0, 'ships', 5, 'ships');
		neditor.link(0, 'ships', 6, 'ships');

		expect(nodes[0].isChildOf(nodes[1])).to.be.false;

		expect(nodes[0].isParentOf(nodes[1])).to.be.true;
		expect(nodes[1].isParentOf(nodes[2])).to.be.true;
		expect(nodes[0].isParentOf(nodes[3])).to.be.true;
		expect(nodes[3].isParentOf(nodes[4])).to.be.true;
		expect(nodes[0].isParentOf(nodes[5])).to.be.true;
		expect(nodes[0].isParentOf(nodes[6])).to.be.true;

		expect(nodes[5].isParentOf(nodes[7])).to.be.false;
		expect(nodes[6].isParentOf(nodes[7])).to.be.false;
		expect(nodes[7].isParentOf(nodes[9])).to.be.false;
		expect(nodes[5].isParentOf(nodes[8])).to.be.false;
		expect(nodes[6].isParentOf(nodes[8])).to.be.false;
		expect(nodes[8].isParentOf(nodes[9])).to.be.false;
		expect(nodes[9].isParentOf(nodes[10])).to.be.false;
		expect(nodes[9].isParentOf(nodes[11])).to.be.false;

		neditor.link(5, 'amount', 7, 'leftValue');
		neditor.link(6, 'amount', 7, 'rightValue');
		neditor.link(7, 'resultValue', 9, 'result');
		neditor.link(5, 'ships', 8, 'leftSet');
		neditor.link(6, 'ships', 8, 'rightSet');
		neditor.link(8, 'resultSet', 9, 'ships');
		neditor.link(9, 'onTrue_ships', 10, 'ships');
		neditor.link(9, 'onFalse_ships', 11, 'ships');

		expect(nodes[5].isParentOf(nodes[7])).to.be.true;
		expect(nodes[6].isParentOf(nodes[7])).to.be.true;
		expect(nodes[7].isParentOf(nodes[9])).to.be.true;
		expect(nodes[5].isParentOf(nodes[8])).to.be.true;
		expect(nodes[6].isParentOf(nodes[8])).to.be.true;
		expect(nodes[8].isParentOf(nodes[9])).to.be.true;
		expect(nodes[9].isParentOf(nodes[10])).to.be.true;
		expect(nodes[9].isParentOf(nodes[11])).to.be.true;

		expect(nodes[0].isParentOf(nodes[2])).to.be.false;
		expect(nodes[0].isParentOf(nodes[11])).to.be.false;
		expect(nodes[11].isParentOf(nodes[9])).to.be.false;

		expect(nodes[11].isChildOf(nodes[9])).to.be.true;
	});

	it("It is possible to get node's children and node's parents", function() {
		var lst;
		lst = nodes[0].getParents();
		expect(lst).to.be.empty;

		lst = nodes[4].getChildren();
		expect(lst).to.be.empty;

		lst = nodes[0].getChildren();
		expect(lst).to.have.members([nodes[1], nodes[3], nodes[5], nodes[6]]);
		lst = nodes[1].getParents();
		expect(lst).to.have.members([nodes[0]]);
		lst = nodes[1].getChildren();
		expect(lst).to.have.members([nodes[2]]);
		lst = nodes[6].getChildren();
		expect(lst).to.have.members([nodes[7], nodes[8]]);
		lst = nodes[7].getParents();
		expect(lst).to.have.members([nodes[5], nodes[6]]);
	});

	it("Circular links checker works", function() {
		// Check strategy.
		expect(nodes[0].name).to.equal('root');
		expect(Engine.nodes.base.isCircular(nodes[0])).to.be.false;

		// Check custom graphs.
		var vertex = function() { return new Engine.nodes.base.Node(0, 'vertex', 'vertex', [{name: 'foo', type: 0}], [{name: 'bar', type: 0}]); };
		var N = 20;
		var graph = [vertex()];
		for (var i = 0; i < N; ++i) {
			var v = vertex();
			graph[i].link('bar', v, 'foo');
			graph.push(v);
		}
		expect(Engine.nodes.base.isCircular(graph[0])).to.be.false;
		graph[N-1].link('bar', graph[0], 'foo');
		expect(Engine.nodes.base.isCircular(graph[0])).to.be.true;
		graph[N-1].unlink('bar', graph[0], 'foo');
		expect(Engine.nodes.base.isCircular(graph[0])).to.be.false;

		var link = function(graph, o, i) { return graph[o].link('bar', graph[i], 'foo'); }
		N = 9;
		graph = [];
		for (var i = 0; i < N; ++i) graph.push(vertex());
		link(graph, 0, 1);
		link(graph, 0, 2);
		link(graph, 1, 3);
		link(graph, 1, 4);
		link(graph, 2, 4);
		link(graph, 2, 5);
		link(graph, 3, 8);
		link(graph, 4, 7);
		link(graph, 5, 6);
		link(graph, 6, 7);
		link(graph, 8, 6);
		expect(Engine.nodes.base.isCircular(graph[0])).to.be.false; // no loop yet.

		link(graph, 7, 8); // this is a loop!
		expect(Engine.nodes.base.isCircular(graph[0])).to.be.true;
		graph[7].unlink('bar', graph[8], 'foo');

		link(graph, 8, 7); // doesn't a loop.
		expect(Engine.nodes.base.isCircular(graph[0])).to.be.false; // still no loops.
	});

	it("Level sort function works", function() {
		expect(nodes[0].name).to.equal('root');
		nodesTree = Engine.nodes.base.buildLST(nodes[0]);
		expect(nodesTree.data).to.have.lengthOf(5);

		var i, j;
		var pos;
		var children, child, k;
		for (i = 0; i < nodesTree.data.length; ++i) {
			expect(nodesTree.data[i]).to.be.not.empty;
			for (j = 0; j < nodesTree.data[i].length; ++j) {
				children = nodesTree.data[i][j].getChildren();
				for (k = 0; k < children.length; ++k) {
					child = children[k];
					pos = nodesTree.find(child);
					expect(pos.level).to.be.above(i);
				}
			}
		}
	});

	it("Simple JSON import/export works", function() {
		var text = Engine.nodes.io.toJson(nodes);
		parsedNodes = Engine.nodes.io.fromJson(text);

		var namer = function(node) { return node.name+'-'+node.id; };
		var names = nodes.map(namer);
		var parsedNames = nodes.map(namer);
		expect(parsedNodes.length).to.equal(nodes.length);
		expect(parsedNames).to.eql(names);

		for (var i = 0; i < nodes.length; ++i) {
			var values = nodes[i].getValues();
			var parsedValues = parsedNodes[i].getValues();
			var parents = nodes[i].getParents().map(namer);
			var parsedParents = parsedNodes[i].getParents().map(namer);
			var children = nodes[i].getChildren().map(namer);
			var parsedChildren = parsedNodes[i].getChildren().map(namer);

			expect(parsedParents).to.eql(parents);
			expect(parsedChildren).to.eql(children);
			expect(parsedValues).to.eql(values);
		}
	});

	it("Data passes from parent nodes to child nodes", function() {
		var units = initUnits();
		nodes[0].initData(units.own, units.enemies, 1);
		var children = nodes[0].getChildren()
		for (var child of children) {
			for (var field in child.inputs) {
				if (!child.inputs[field].constant)
					expect(child.inputs[field].data).to.be.null;
			}
		}

		nodes[0].execute();
		expect(nodes[1].inputs.ships.data).to.eql(units);
		expect(nodes[3].inputs.ships.data).to.eql(units);
		for (var child of children) {
			expect(child.isReady()).to.be.true;
		}

		expect(nodes[1].isParentOf(nodes[2])).to.be.true;
		expect(nodes[2].getParents()).to.have.lengthOf(1);
		expect(nodes[2].isReady()).to.be.false;

		// execute calls pushData
		nodes[1].execute();
		expect(nodes[2].isReady()).to.be.true;
	});

	it("Node refresh() cleans non-constant ports' data", function() {
		expect(nodes[6].isParentOf(nodes[8])).to.be.true;
		var beforeConstsNum = 0;
		for (var field in nodes[6].inputs) {
			if (nodes[6].inputs[field].constant)
				++beforeConstsNum;
		}
		expect(beforeConstsNum).to.be.above(0);

		expect(nodes[8].isReady()).to.be.false;
		var parents = nodes[8].getParents();
		for (var parent of parents) {
			expect(parent.isReady()).to.be.true;
			parent.execute();
		}
		expect(nodes[8].isReady()).to.be.true;
		nodes[8].execute();

		var afterConstsNum = 0;
		var values = nodes[6].getValues();
		nodes[6].refresh();
		for (var field in nodes[6].inputs) {
			var input = nodes[6].inputs[field];
			if (input.constant) {
				++afterConstsNum;
				expect(input.data).to.be.not.null;
				expect(values).to.include(input.data);
			} else {
				expect(input.data).to.be.null;
			}
		}
		expect(afterConstsNum).to.equal(beforeConstsNum);

		for (var field in nodes[6].outputs) {
			var output = nodes[6].outputs[field];
			expect(output.data).to.be.null;
		}

		for (var field in nodes[8].inputs) {
			var input = nodes[8].inputs[field];
			expect(input.data).to.be.not.null;
		}
	});
});
