"use strict"


// Nodes Html setup.
const nodesContainerHtmlId = "asg-node-container";
const nodesHtmlId = "asg-nodeId";
const nodesInSep = "-in-";
const nodesOutSep = "-out-";

// jsPlumb setup.
var defaults = {
	plumbInstance: {
		Container: nodesContainerHtmlId,
		DragOptions: { cursor: 'pointer', zIndex: 2000 },
		// ConnectionOverlays: [
		// 	[ "Arrow", {
		// 		visible: true,
		// 		width: 11,
		// 		length: 16,
		// 		location: 0.8,
		// 		id:"ARROW"
		// 	} ]
		// ]
	}
};
defaults.connectorPaintStyle = {
	strokeWidth: 2,
	stroke: "#535353",
	joinstyle: "round",
	outlineStroke: null
};
defaults.endpointHoverStyle = {
	fill: "#216477",
	outlineStroke: null
};
defaults.connectorHoverStyle = {
	stroke: "#216477",
	outlineStroke: null
};
defaults.sourceProperties = {
	isSource: true,
	endpoint: "Dot",
	paintStyle: {
		stroke: "#7AB02C",
		fill: "transparent",
		radius: 5,
		strokeWidth: 1
	},
	connector: [ "Bezier", { curviness: 150 } ],
	connectorStyle: defaults.connectorPaintStyle,
	hoverPaintStyle: defaults.endpointHoverStyle,
	connectorHoverStyle: defaults.connectorHoverStyle,
	dragOptions: {},
	maxConnections: -1,
	overlays: [
		[ "Label", {
			location: [0.0, 0.5],
			label: "Source",
			cssClass: "endpointSourceLabel",
			visible: true
		} ]
	]
};
defaults.targetProperties = {
	isTarget: true,
	endpoint: "Dot",
	paintStyle: {
		fill: "#7AB02C",
		radius: 5
	},
	connectorStyle: defaults.connectorPaintStyle,
	hoverPaintStyle: defaults.endpointHoverStyle,
	connectorHoverStyle: defaults.connectorHoverStyle,
	dropOptions: { hoverClass: "hover", activeClass: "active" },
	maxConnections: -1,
	overlays: [
		[ "Label", {
			location: [0.0, 0.5],
			label: "Target",
			cssClass: "endpointTargetLabel",
			visible: true
		} ]
	]
};


var Node = {
	Link: function(sourceId, sourcePort, targetId, targetPort) {
		return {
			source: {
				id: sourceId,
				port: sourcePort
			},
			target: {
				id: targetId,
				port: targetPort
			},
			equal(lnk) {
				return ((this.source.id == lnk.source.id)
						&& (this.source.port == lnk.source.port)
						&& (this.target.id == lnk.target.id)
						&& (this.target.port == lnk.target.port));
			}
		};
	},
	Block: function(id, name, inputFields, outputFields) {
		var inputs = [];
		var outputs = [];
		for (var field of inputFields) {
			inputs.push({ name: field, data: null });
		}
		for (var field of outputFields) {
			outputs.push({ name: field });
		}
		return {
			id: id,
			name: name,
			inputs: inputs,
			outputs: outputs
		};
	}
};

var NodeEditor = function(plumb) {
	return {
		cfg: {},
		plumb: plumb,
		nodes: [],
		links: [],
		createNode: function(name) {
			var id = this.nodes.length;
			var node = new Node.Block(id, name, this.cfg[name].inputs, this.cfg[name].outputs);

			var nodeHtml = $("<div>", {"id": nodesHtmlId + node.id, "class": "window jtk-node asg-node"});
			nodeHtml.append("<p>"+node.name+"</p>");
			for (var i = 0; i < node.inputs.length; ++i) {
				// nodeHtml.append("<p>"+node.inputs[i].name+"</p>");
			}

			var nodeContainer = $("#" + nodesContainerHtmlId);
			nodeContainer.append(nodeHtml);
			this.plumb.setContainer(nodeContainer);

			var len = node.inputs.length + node.outputs.length + 1;
			for (var i = 0; i < node.outputs.length; ++i) {
				defaults.sourceProperties.overlays[0][1].label = node.outputs[i].name;
				plumb.addEndpoint(nodesHtmlId + node.id, defaults.sourceProperties, {
					anchor: [1.0, (i+1) / len, 0.6, 0],
					uuid: node.id + nodesOutSep + node.outputs[i].name
				});
			}
			var offset = node.outputs.length + 1;
			for (var i = 0; i < node.inputs.length; ++i) {
				defaults.targetProperties.overlays[0][1].label = node.inputs[i].name;
				plumb.addEndpoint(nodesHtmlId + node.id, defaults.targetProperties, {
					anchor: [0.0, (i+offset) / len, -0.6, 0],
					uuid: node.id + nodesInSep + node.inputs[i].name
				});
			}

			this.plumb.draggable(nodeHtml, {containment: true});
			this.nodes.push(node);
			return node;
		},
		deleteNode: function(id) {
			var idx = this.indexNode(id);
			if (idx == -1)
				return false;

			var i = 0;
			var link;
			while (i < this.links.length) {
				link = this.links[i];
				if ((link.source.id == id)
						|| (link.target.id == id)) {
					this.links.splice(i, 1);
					continue;
				}
				++i;
			}

			this.nodes.splice(idx, 1);
			this.plumb.empty(nodesHtmlId + node.id);
			$("#" + nodesHtmlId + node.id).remove();
			return true;
		},
		deleteAll() {
			this.nodes = [];
			this.links = [];
			this.plumb.deleteEveryEndpoint();
			$("#" + nodesContainerHtmlId).empty();
		},
		indexLink(lnk) {
			for (var i = 0; i < this.links.length; ++i) {
				if (lnk.equal(this.links[i]))
					return i;
			}
			return -1;
		},
		indexNode(id) {
			for (var i = 0; i < this.nodes.length; ++i) {
				if (this.nodes[i].id == id)
					return i;
			}
			return -1;
		},
		makeLink(connection) {
			var input = connection.endpoints[1].getUuid();
			var output = connection.endpoints[0].getUuid();
			if ((input == null) || (output == null))
				return false;

			var ilst = input.split(nodesInSep);
			var olst = output.split(nodesOutSep);

			if ((this.indexNode(olst[0]) == -1)
					|| (this.indexNode(ilst[0]) == -1)) {
				this.plumb.detach(connection);
				return false;
			}

			var lnk = new Node.Link(ilst[0], ilst[1], olst[0], olst[1]);
			if (this.indexLink(lnk) != -1) {
				this.plumb.detach(connection);
				return false;
			}

			console.log(`Linking: ${olst} --> ${ilst}`);
			this.links.push(lnk);
			return true;
		},
		freeLink(connection) {
			var input = connection.endpoints[1].getUuid();
			var output = connection.endpoints[0].getUuid();
			if ((input == null) || (output == null))
				return;

			var ilst = input.split(nodesInSep);
			var olst = output.split(nodesOutSep);

			if ((this.indexNode(olst[0]) == -1)
					|| (this.indexNode(ilst[0]) == -1))
				return false;

			var idx = this.indexLink(new Node.Link(ilst[0], ilst[1], olst[0], olst[1]));
			if (idx == -1)
				return false;

			console.log(`Unlinking: ${olst} --> ${ilst}`);
			this.links.splice(idx, 1);
			return true;
		},
		detachLink(connection) {
			var res = this.freeLink(connection);
			if (res)
				this.plumb.detach(connection);

			return res;
		},
		fromJson: function(data) {
			this.deleteAll();

			this.nodes = [];
			for (var node of data.nodes) {
				this.createNode(node.name)
			}

			this.links = [];
			for (var link of data.links) {
				this.links.push(new Node.Link(link.source.id, link.source.port, link.target.id, link.target.port));
				this.plumb.connect({
					uuids: [
						link.source.id + nodesOutSep + link.source.port,
						link.target.id + nodesInSep + link.target.port
					],
					editable: true
				});
			}
		},
		toJson: function() {
			return JSON.stringify({
				"nodes": this.nodes,
				"links": this.links
			});
		}
	};
};

var nodeEditor;


jsPlumb.ready(function () {
	var jpi = window.jsp = jsPlumb.getInstance(defaults.plumb);

	// suspend drawing and initialise.
	jpi.batch(function () {
		nodeEditor = new NodeEditor(jpi);

		jpi.bind("connection", function (info, originalEvent) {
			console.log(nodeEditor.makeLink(info.connection));
		});
		jpi.bind("connectionDrag", function (connection) {
			console.log(nodeEditor.freeLink(connection));
		});
		jpi.bind("click", function (connection, originalEvent) {
			console.log(nodeEditor.detachLink(connection));
		});
	});
	// jsPlumb.fire("jsPlumbDemoLoaded", jpi);
});
