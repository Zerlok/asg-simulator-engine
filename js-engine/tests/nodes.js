"use strict"

var chai = require('chai');
var expect = chai.expect;

var Units = require('../units/base');
var Nodes = require('../nodes/specials');
Nodes.io = require('../nodes/io');
Nodes.Editor = require('../nodes/editor').Editor;

var neditor = new Nodes.Editor();
var nodes = neditor.nodes;
var nodesTree, parsedNodes;

var units = {attacker: [], defender: [], len: 5};
for (var type in Units.config.types) {
	for (var i = 0; i < units.len; ++i) {
		units.attacker.push(new Units.Unit(type));
		units.defender.push(new Units.Unit(type));
	}
}


// http://stackoverflow.com/questions/28400459/referenceerror-describe-is-not-defined-nodejs
const tests = [
	describe("Nodes:", function() {
		it("Root execution", function() {
			var node = new Nodes.Root(0, 'node');
			expect(node.isReady()).to.be.false;

			node.initData(units.attacker, units.defender, 4);
			expect(node.isReady()).to.be.true;

			node.execute();
			expect(node.outputs.own.data).to.eql(units.attacker);
			expect(node.outputs.enemies.data).to.eql(units.attacker);
			expect(node.outputs.round.data).to.equal(4);
		});

		it("Filter execution", function() {
			var node, filtered;
			node = new Nodes.Filter(0, 'node');
			expect(node.isReady()).to.be.false;

			node.inputs.ships.setConstData(units.attacker);
			node.inputs.type.setConstData('fighter');
			expect(node.isReady()).to.be.true;

			filtered = units.attacker.filter(function(x){ if (x.type == 'fighter') return x; });
			node.execute();
			expect(node.outputs.ships.data).to.eql(filtered);

			node = new Nodes.Filter(0, 'node');
			node.inputs.ships.setConstData(units.defender);
			node.inputs.health.setConstData({'op': 'lt', 'value': 200});
			filtered = units.defender.filter(function(x){ if (x.health < 200) return x; });
			node.execute();
			expect(node.outputs.ships.data).to.eql(filtered);
		});

		it("Manipulator execution", function() {
			var node;
			node = new Nodes.Manipulator(0, 'node');
			expect(node.isReady()).to.be.false;

			node.inputs.left.setConstData(units.attacker);
			node.inputs.right.setConstData(units.defender);
			node.inputs.operation.setConstData('union');
			var result = units.attacker.concat(units.defender);
			node.execute();
			expect(node.outputs.ships.data).to.eql(result);
		});

		it("Conditional execution", function() {
			var node;
			node = new Nodes.Conditional(0, 'node');
			node.inputs.left.setConstData(units.attacker);
			node.inputs.right.setConstData(200);

			node.inputs.operator.setConstData('lt');
			node.execute();
			expect(node.outputs.result.data).to.be.true;

			node.inputs.operator.setConstData('eq');
			node.execute();
			expect(node.outputs.result.data).to.be.false;

			node.inputs.operator.setConstData('gt');
			node.inputs.right.setConstData(10);
			node.execute();
			expect(node.outputs.result.data).to.be.true;
		});

		it("Fork execution", function() {
			var node;
			node = new Nodes.Fork(0, 'node');
			node.inputs.own.setConstData(units.attacker);
			node.inputs.enemies.setConstData(units.defender);

			expect(node.onTrue.own.data).to.be.null;
			expect(node.onTrue.enemies.data).to.be.null;
			expect(node.onFalse.own.data).to.be.null;
			expect(node.onFalse.enemies.data).to.be.null;

			node.inputs.result.setConstData(5);
			node.execute();
			expect(node.onTrue.own.data).to.be.eql(units.attacker);
			expect(node.onTrue.enemies.data).to.be.eql(units.defender);
			expect(node.onFalse.own.data).to.be.null;
			expect(node.onFalse.enemies.data).to.be.null;

			node.inputs.result.setConstData(false);
			node.execute();
			expect(node.onTrue.own.data).to.be.null;
			expect(node.onTrue.enemies.data).to.be.null;
			expect(node.onFalse.own.data).to.be.eql(units.attacker);
			expect(node.onFalse.enemies.data).to.be.eql(units.defender);
		});

		it("FireCmd execution", function() {
			var node;
			expect(false).to.be.ok;
		});

		it("HoldCmd execution", function() {
			var node;
			expect(false).to.be.ok;
		});

		it("MoveCmd execution", function() {
			var node;
			expect(false).to.be.ok;
		});

		it("Every node is registered in node factory", function() {
			for (var i in Nodes.config.types) {
				var name = Nodes.config.types[i];
				var node = Nodes.factory.create(name, i, name);

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
			expect(node.inputs.health.data).to.be.null;

			node = neditor.createNode('filter').setValue('type', 'fighter');
			expect(node.name).to.equal('filter');
			expect(node.inputs.type.data).to.equal('fighter');
			expect(node.inputs.health.data).to.be.null;

			node = neditor.createNode('cmdFire');
			expect(node.name).to.equal('cmdFire');
			expect(node.inputs.type).to.be.undefined;

			node = neditor.createNode('filter').setValue('health', {'op': 'le', 'value': 40});
			expect(node.name).to.equal('filter');
			expect(node.inputs.type.data).to.be.null;
			expect(node.inputs.health.data).to.eql({'op': 'le', 'value': 40});

			node = neditor.createNode('cmdHold');
			expect(node.name).to.equal('cmdHold');

			node = neditor.createNode('filter').setValue('type', 'demolisher');
			expect(node.name).to.equal('filter');
			expect(node.inputs.type.data).to.equal('demolisher');
			expect(node.inputs.health.data).to.be.null;

			neditor.createNode('filter').setValue('type', 'demolisher');
			neditor.createNode('conditional').setValue('operator', 'gt');
			neditor.createNode('fork');
			neditor.createNode('cmdHold');
			neditor.createNode('cmdFire');

			expect(nodes).to.have.lengthOf(12);
		});

		it("Linking creates a directed graph structure", function() {
			neditor.link(0, 'own', 1, 'ships');
			neditor.link(0, 'enemies', 2, 'ships');
			neditor.link(1, 'ships', 3, 'own');
			neditor.link(2, 'ships', 3, 'enemies');
			neditor.link(0, 'own', 4, 'ships');
			neditor.link(4, 'ships', 5, 'own');
			neditor.link(0, 'own', 6, 'ships');
			neditor.link(0, 'enemies', 7, 'ships');

			expect(nodes[0].isChildOf(nodes[1])).to.be.false;

			expect(nodes[0].isParentOf(nodes[1])).to.be.true;
			expect(nodes[0].isParentOf(nodes[2])).to.be.true;
			expect(nodes[1].isParentOf(nodes[3])).to.be.true;
			expect(nodes[2].isParentOf(nodes[3])).to.be.true;
			expect(nodes[0].isParentOf(nodes[4])).to.be.true;
			expect(nodes[4].isParentOf(nodes[5])).to.be.true;
			expect(nodes[0].isParentOf(nodes[6])).to.be.true;
			expect(nodes[0].isParentOf(nodes[7])).to.be.true;

			expect(nodes[6].isParentOf(nodes[8])).to.be.false;
			expect(nodes[7].isParentOf(nodes[8])).to.be.false;
			expect(nodes[8].isParentOf(nodes[9])).to.be.false;
			expect(nodes[6].isParentOf(nodes[9])).to.be.false;
			expect(nodes[7].isParentOf(nodes[9])).to.be.false;
			expect(nodes[9].isParentOf(nodes[10])).to.be.false;
			expect(nodes[9].isParentOf(nodes[11])).to.be.false;

			neditor.link(6, 'ships', 8, 'left');
			neditor.link(7, 'ships', 8, 'right');
			neditor.link(8, 'result', 9, 'result');
			neditor.link(6, 'ships', 9, 'own');
			neditor.link(7, 'ships', 9, 'enemies');
			neditor.link(9, 'onTrue_own', 10, 'own');
			neditor.link(9, 'onFalse_own', 11, 'own');
			neditor.link(9, 'onFalse_enemies', 11, 'enemies');

			expect(nodes[6].isParentOf(nodes[8])).to.be.true;
			expect(nodes[7].isParentOf(nodes[8])).to.be.true;
			expect(nodes[8].isParentOf(nodes[9])).to.be.true;
			expect(nodes[6].isParentOf(nodes[9])).to.be.true;
			expect(nodes[7].isParentOf(nodes[9])).to.be.true;
			expect(nodes[9].isParentOf(nodes[10])).to.be.true;
			expect(nodes[9].isParentOf(nodes[11])).to.be.true;

			expect(nodes[0].isParentOf(nodes[3])).to.be.false;
			expect(nodes[0].isParentOf(nodes[11])).to.be.false;
			expect(nodes[11].isParentOf(nodes[9])).to.be.false;

			expect(nodes[11].isChildOf(nodes[9])).to.be.true;
		});

		it("It is possible to get node's children and node's parents", function() {
			var lst;
			lst = nodes[0].getParents();
			expect(lst).to.be.empty;

			lst = nodes[5].getChildren();
			expect(lst).to.be.empty;

			lst = nodes[0].getChildren();
			expect(lst).to.have.members([nodes[1], nodes[4], nodes[6], nodes[2], nodes[7]]);
			lst = nodes[1].getParents();
			expect(lst).to.have.members([nodes[0]]);
			lst = nodes[2].getChildren();
			expect(lst).to.have.members([nodes[3]]);
			lst = nodes[7].getChildren();
			expect(lst).to.have.members([nodes[8], nodes[9]]);
			lst = nodes[8].getParents();
			expect(lst).to.have.members([nodes[6], nodes[7]]);
		});

		it("Circular links checker works", function() {
			var vertex = function() { return new Nodes.base.Node(0, 'node', ['foo'], ['bar']); };
			expect(nodes[0].name).to.equal('root');
			expect(Nodes.base.isCircular(nodes[0])).to.be.false;

			var N = 20;
			var graph = [vertex()];
			for (var i = 0; i < N; ++i) {
				var v = vertex();
				graph[i].link('bar', v, 'foo');
				graph.push(v);
			}
			expect(Nodes.base.isCircular(graph[0])).to.be.false;
			graph[N-1].link('bar', graph[0], 'foo');
			expect(Nodes.base.isCircular(graph[0])).to.be.true;
			graph[N-1].unlink('bar', graph[0], 'foo');
			expect(Nodes.base.isCircular(graph[0])).to.be.false;

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
			expect(Nodes.base.isCircular(graph[0])).to.be.false; // no loop yet.

			link(graph, 7, 8); // this is a loop!
			expect(Nodes.base.isCircular(graph[0])).to.be.true;
			graph[7].unlink('bar', graph[8], 'foo');

			link(graph, 8, 7); // doesn't a loop.
			expect(Nodes.base.isCircular(graph[0])).to.be.false; // still no loops.
		});

		it("Level sort function works", function() {
			expect(nodes[0].name).to.equal('root');
			nodesTree = Nodes.base.buildLSH(nodes[0]);
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
			var text = Nodes.io.toJson(nodes);
			parsedNodes = Nodes.io.fromJson(text);

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
			nodes[0].outputs.own.setConstData(units.attacker);
			nodes[0].outputs.enemies.setConstData(units.defender);
			var children = nodes[0].getChildren()
			for (var child of children) {
				for (var field in child.inputs) {
					if (!child.inputs[field].constant)
						expect(child.inputs[field].data).to.be.null;
				}
			}

			nodes[0].pushData();
			expect(nodes[1].inputs.ships.data).to.eql(units.attacker);
			expect(nodes[2].inputs.ships.data).to.eql(units.defender);
			for (var child of children) {
				expect(child.isReady()).to.be.true;
			}

			expect(nodes[1].isParentOf(nodes[3])).to.be.true;
			expect(nodes[2].isParentOf(nodes[3])).to.be.true;
			expect(nodes[3].getParents()).to.have.lengthOf(2);
			expect(nodes[3].isReady()).to.be.false;

			// execute calls pushData
			nodes[1].execute();
			nodes[2].execute();
			expect(nodes[3].isReady()).to.be.true;
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
	})
];


module.exports = tests;
