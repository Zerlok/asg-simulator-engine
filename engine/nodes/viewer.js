"use strict"


const nodesContainerId = "asg-node-container";
const nodesId = "asg-nodeId";

// jsPlumb setup.
var defaults = {
	plumbInstance: {
		Container: nodesContainerId,
		DragOptions: { cursor: 'pointer', zIndex: 2000 },
		ConnectionOverlays: [
			[ "Arrow", {
				visible: true,
				width: 11,
				length: 16,
				location: 0.8,
				id:"ARROW"
			} ]
		]
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
	maxConnections: -1
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
	maxConnections: -1
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

			var nodeHtml = $("<div>", {"id": nodesId+node.id, "class": "window jtk-node asg-node"});
			nodeHtml.append("<p>"+node.name+"</p>");
			for (var i = 0; i < node.inputs.length; ++i) {
				// nodeHtml.append("<p>"+node.inputs[i].name+"</p>");
			}

			var nodeContainer = $("#asg-node-container");
			nodeContainer.append(nodeHtml);
			this.plumb.setContainer(nodeContainer);

			var len = node.inputs.length;
			for (var i = 0; i < len; ++i) {
				plumb.addEndpoint(nodesId + node.id, defaults.targetProperties, {
					anchor: [0.0, (i+1) / (len+1), -0.8, 0],
					uuid: node.id + "-in-" + node.inputs[i].name
				});
			}
			len = node.outputs.length;
			for (var i = 0; i < len; ++i) {
				plumb.addEndpoint(nodesId + node.id, defaults.sourceProperties, {
					anchor: [1.0, (i+1) / (len+1), 0.8, 0],
					uuid: node.id + "-out-" + node.outputs[i].name
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
			return true;
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
		makeLink(sid, sp, tid, tp) {
			if ((this.indexNode(sid) == -1)
					|| (this.indexNode(tid) == -1))
				return false;

			var lnk = new Node.Link(sid, sp, tid, tp);
			if (this.indexLink(lnk) != -1)
				return false;

			this.links.push(lnk);
			return true;
		},
		freeLink(sid, sp, tid, tp) {
			if ((this.indexNode(sid) == -1)
					|| (this.indexNode(tid) == -1))
				return false;

			var idx = this.indexLink(new Node.Link(sid, sp, tid, tp));
			if (idx == -1)
				return false;

			this.links.splice(idx, 1);
			return true;
		},
		detachLink(conn, sid, sp, tid, tp) {
			this.freeLink(sid, sp, tid, tp);
			this.plumb.detach(conn);
		},
		fromJson: function(data) {
			// TODO: remove all previous nodes and links.
			if (data == null) {
				this.nodes = [];
				this.links = [];
				return;
			}
			// var data = JSON.parse(text);
			this.nodes = data.nodes;
			this.links = data.links;
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
			var input = info.connection.endpoints[1].getUuid();
			var output = info.connection.endpoints[0].getUuid();
			if ((input == null) || (output == null))
				return;

			var olst = output.split("-out-");
			var ilst = input.split("-in-");
			var res = nodeEditor.makeLink(olst[0], olst[1], ilst[0], ilst[1]);
			console.log(`Linking: ${output} --> ${input} ${res}`);
		});

		jpi.bind("connectionDrag", function (connection) {
			var input = connection.endpoints[1].getUuid();
			var output = connection.endpoints[0].getUuid();
			if ((input == null) || (output == null))
				return;

			var olst = output.split("-out-");
			var ilst = input.split("-in-");
			var res = nodeEditor.freeLink(olst[0], olst[1], ilst[0], ilst[1]);
			console.log(`Unlinking: ${output} --> ${input} ${res}`);
		});

		jpi.bind("click", function (connection, originalEvent) {
			var input = connection.endpoints[1].getUuid();
			var output = connection.endpoints[0].getUuid();
			if ((input == null) || (output == null))
				return;

			var olst = output.split("-out-");
			var ilst = input.split("-in-");
			var res = nodeEditor.detachLink(connection, olst[0], olst[1], ilst[0], ilst[1]);
			console.log(`Unlinking: ${output} --> ${input} ${res}`);
		});
	});
	// jsPlumb.fire("jsPlumbDemoLoaded", jpi);
});
