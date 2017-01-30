"use strict"

var chai = require('chai');
var expect = chai.expect;

var Nodes = require('../nodes/specials');
Nodes.io = require('../nodes/io');
Nodes.Editor = require('../nodes/editor').Editor;

var neditor = new Nodes.Editor();
var nodes = neditor.nodes;


// http://stackoverflow.com/questions/28400459/referenceerror-describe-is-not-defined-nodejs
const tests = [
	describe("Nodes:", function() {
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

		it("Circular links checker function works", function() {
			expect(nodes[0].name).to.equal('root');
			expect(Nodes.base.isCircular(nodes[0])).to.be.false;
		});

		it("Level sort function works", function() {
			expect(nodes[0].name).to.equal('root');
			var tree = Nodes.base.buildLSH(nodes[0]);
			expect(tree.data).to.have.lengthOf(5);
		});

		it("Simple JSON import/export", function() {
			var text = Nodes.io.toJson(nodes);
			var parsedNodes = Nodes.io.fromJson(text);

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
			// TODO: test nodes data passing and receiving.
			expect(false).to.be.ok;
		});

		it("Node refresh() cleans non-constant ports' data", function() {
			// TODO: test refresh() method.
			expect(false).to.be.ok;
		});

	})
];


module.exports = tests;
