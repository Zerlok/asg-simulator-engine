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
	Block: function(plumb, id, name, inputFields, outputFields) {
		var inputs = [];
		var outputs = [];

		// Add html block to Node container.
		var nodeContainer = $("#" + nodesContainerHtmlId);
		var htmlBlock = $("<div>", {"id": nodesHtmlId + id, "class": "window jtk-node asg-node"});
		htmlBlock.append("<p>"+name+"</p>");
		nodeContainer.append(htmlBlock);
		plumb.setContainer(nodeContainer);

		// Register output Endpoints.
		var len = inputFields.length + outputFields.length + 1;
		var offset = 1;
		var field;
		for (var i = 0; i < outputFields.length; ++i) {
			field = outputFields[i];
			outputs.push({ name: field });

			defaults.sourceProperties.overlays[0][1].label = field;
			plumb.addEndpoint(nodesHtmlId + id, defaults.sourceProperties, {
				anchor: [1.0, (i+offset) / len, 0.6, 0],
				uuid: id + nodesOutSep + field
			});
		}

		// Register input Endpoints.
		offset += outputFields.length;
		for (var i = 0; i < inputFields.length; ++i) {
			field = inputFields[i];
			inputs.push({ name: field, data: null });

			defaults.targetProperties.overlays[0][1].label = field;
			plumb.addEndpoint(nodesHtmlId + id, defaults.targetProperties, {
				anchor: [0.0, (i+offset) / len, -0.6, 0],
				uuid: id + nodesInSep + field
			});
		}

		plumb.draggable(htmlBlock, {containment: true});
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
		idCntr: 0,
		createNode: function(name) {
			if (!this.cfg.hasOwnProperty(name)) {
				console.error(`Unknown node name: ${name}`);
				return null;
			}

			var node = new Node.Block(this.plumb, this.idCntr, name, this.cfg[name].inputs, this.cfg[name].outputs);
			this.nodes.push(node);
			++this.idCntr;

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
		indexNode(id) {
			for (var i = 0; i < this.nodes.length; ++i) {
				if (this.nodes[i].id == id)
				return i;
			}
			return -1;
		},
		createLink(sid, sp, tid, tp) {
			if ((this.indexNode(sid) == -1)
					|| (this.indexNode(tid) == -1)) {
				return false;
			}

			var lnk = new Node.Link(sid, sp, tid, tp);
			if (this.indexLink(lnk) != -1) {
				return false;
			}

			console.log(`Linking: ${sid}-${sp} --> ${tid}-${tp}`);
			this.links.push(lnk);
			return true;
		},
		removeLink(sid, sp, tid, tp) {
			if ((this.indexNode(sid) == -1)
					|| (this.indexNode(tid) == -1))
				return false;

			var idx = this.indexLink(new Node.Link(sid, sp, tid, tp));
			if (idx == -1)
				return false;

			console.log(`Unlinking: ${sid}-${sp} --> ${tid}-${tp}`);
			this.links.splice(idx, 1);
			return true;
		},
		indexLink(lnk) {
			for (var i = 0; i < this.links.length; ++i) {
				if (lnk.equal(this.links[i]))
					return i;
			}
			return -1;
		},
		appendConnection(connection) {
			if (!connection.hasOwnProperty('endpoints')) {
				console.error("Invalid connection (on append):");
				console.error(connection);
				return false;
			}

			var input = connection.endpoints[1].getUuid();
			var output = connection.endpoints[0].getUuid();
			if ((input == null) || (output == null))
				return false;

			var ilst = input.split(nodesInSep);
			var olst = output.split(nodesOutSep);

			return this.createLink(olst[0], olst[1], ilst[0], ilst[1]);
		},
		extractConnection(connection) {
			if (!connection.hasOwnProperty('endpoints')) {
				console.error("Invalid connection (on extract):");
				console.error(connection);
				return false;
			}

			var input = connection.endpoints[1].getUuid();
			var output = connection.endpoints[0].getUuid();
			if ((input == null) || (output == null))
				return false;

			var ilst = input.split(nodesInSep);
			var olst = output.split(nodesOutSep);

			return this.removeLink(olst[0], olst[1], ilst[0], ilst[1]);
		},
		removeConnection(connection) {
			if (!connection.hasOwnProperty('endpoints')) {
				console.error("Invalid connection (on delete):");
				console.error(connection);
				return false;
			}

			var input = connection.endpoints[1].getUuid();
			var output = connection.endpoints[0].getUuid();
			if ((input == null) || (output == null))
				return false;

			var ilst = input.split(nodesInSep);
			var olst = output.split(nodesOutSep);

			var res = this.removeLink(olst[0], olst[1], ilst[0], ilst[1]);
			if (res) // if connection was unlinked - stop to draw it.
				this.plumb.detach(connection);

			return res;
		},
		clearAll() {
			this.idCntr = 0;
			this.nodes = [];
			this.links = [];
			this.plumb.deleteEveryEndpoint();
			$("#" + nodesContainerHtmlId).empty();
		},
		fromJson: function(data) {
			this.clearAll();
			if (data == null) {
				data = {
					'nodes': [],
					'links': []
				};
			}

			// Create each node.
			this.nodes = [];
			for (var node of data.nodes) {
				this.createNode(node.name);
			}

			// Draw every connection.
			this.links = [];
			for (var link of data.links) {
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
				'nodes': this.nodes,
				'links': this.links
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
			console.log(nodeEditor.appendConnection(info.connection));
		});
		jpi.bind("connectionDrag", function (connection) {
			console.log(nodeEditor.extractConnection(connection));
		});
		jpi.bind("click", function (connection, originalEvent) {
			console.log(nodeEditor.removeConnection(connection));
		});
	});
	// jsPlumb.fire("jsPlumbDemoLoaded", jpi);
});
