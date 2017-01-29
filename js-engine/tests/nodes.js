"use strict"

var chai = require('chai');
var expect = chai.expect;

var Nodes = require('../nodes/specials');


var parentNode = new Nodes.Node(69, 'Parent', [], ['arg1', 'arg2', 'arg3']);
var children = [
	new Nodes.Node(0, 'Child0', ['arg'], ['something']),
	new Nodes.Node(1, 'Child1', ['foo', 'bar'], ['vals1', 'vals2']),
	new Nodes.Node(2, 'Child2', ['hoo'], ['vals3']),
	new Nodes.Node(3, 'Child3', ['roo', 'lar'], ['vals4'])
];


// http://stackoverflow.com/questions/28400459/referenceerror-describe-is-not-defined-nodejs
const tests = [
	describe('Nodes', function() {
		it("Every node is registered in node factory", function() {
			for (var i in Nodes.config.types) {
				var name = Nodes.config.types[i];
				var node = Nodes.factory.create(name, i, name);

				expect(node).to.be.ok;
				expect(node.id).to.equal(i);
				expect(node.name).to.equal(name);
			}
		});

		it("Linking creates a directed graph structure", function() {
			/*
			p:0 -> 0:0,
			p:1 -> 1:1,
			1:0 -> 2:0,
			0:0 -> 1:0,
			1:1 -> 3:1,
			2:0 -> 3:0
			*/
			var res;
			res = parentNode.link(0, children[0], 0);
			expect(res).to.be.true;
			expect(parentNode.isParentOf(children[0])).to.be.true;
			expect(children[0].isChildOf(parentNode)).to.be.true;
			res = parentNode.link(0, children[0], 0);
			expect(res).to.be.false;

			res = parentNode.link('arg2', children[1], 'bar');
			expect(res).to.be.true;
			expect(parentNode.isParentOf(children[1])).to.be.true;
			expect(children[1].isChildOf(parentNode)).to.be.true;

			children[1].outputs.vals1.link(children[2].inputs.hoo);
			expect(children[1].isParentOf(children[2])).to.be.true;
			expect(children[2].isChildOf(children[1])).to.be.true;
			expect(parentNode.isParentOf(children[2])).to.be.false;

			res = children[0].outputs.something.link(children[1].inputs.foo);
			expect(children[0].isParentOf(children[1])).to.be.true;
			expect(children[1].isChildOf(children[0])).to.be.true;

			res = children[1].link(1, children[3], 1);
			expect(children[1].isParentOf(children[3])).to.be.true;

			res = children[2].link(0, children[3], 0);
			expect(children[2].isParentOf(children[3])).to.be.true;
		});

		it("It is possible to get node's children and node's parents", function() {
			var lst;
			expect(parentNode.getParents()).to.be.empty;
			expect(children[3].getChildren()).to.be.empty;

			lst = parentNode.getChildren();
			expect(lst).to.contain.all(children[0], children[1]);
			expect(lst).to.have.length.at.most(2);
			lst = children[0].getParents();
			expect(lst).to.contain.all(parentNode);
			expect(lst).to.have.length.at.most(1);

			lst = children[0].getChildren();
			expect(lst).to.contain.all(children[1]);
			expect(lst).to.have.length.at.most(1);
			lst = children[1].getParents();
			expect(lst).to.contain.all(parentNode, children[0]);
			expect(lst).to.have.length.at.most(2);
		});

		it("Data passes from parent nodes to child nodes", function() {
			// TODO: test nodes data passing and receiving.
			expect(false).to.be.ok;
		});

		it("Node refresh() cleans non-constant ports' data", function() {
			// TODO: test refresh() method.
			expect(false).to.be.ok;
		});

		it("Simple JSON import/export", function() {
			// TODO: pass created strategy to JSON and back and compare results.
			expect(false).to.be.ok;
		});

		it("Level sort function works", function() {
			// TODO: test level sort.
			expect(false).to.be.ok;
		});
	})
];


module.exports = tests;
