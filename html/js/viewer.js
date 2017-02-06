"use strict"


// Nodes Html setup.
const nodesContainerHtmlId = "asg-node-container";
const nodesHtmlId = "asg-nodeId";
const nodesConstInputCls = "node-const-value-field";
const nodesInSep = "-in-";
const nodesOutSep = "-out-";
const nodesBlockCls = "node-block-";

// jsPlumb setup.
var defaults = {
	plumbInstance: {
		Container: nodesContainerHtmlId,
		DragOptions: { cursor: 'pointer', zIndex: 2000 }
	}
};
defaults.connectorPaintStyle = {
	strokeWidth: 2,
	stroke: "#535353",
	joinstyle: "round",
	outlineStroke: null
};
defaults.endpointHoverStyle = {
	fill: "#5194A7",
	outlineStroke: null
};
defaults.connectorHoverStyle = {
	stroke: "#5194A7",
	outlineStroke: null
};
defaults.sourceProperties = {
	isSource: true,
	endpoint: "Dot",
	paintStyle: {
		stroke: "#2085A5",
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
			visible: false
		} ]
	]
};
defaults.targetProperties = {
	isTarget: true,
	endpoint: "Dot",
	paintStyle: {
		fill: "#2085A5",
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
			visible: false
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
	Block: function(plumb, id, name, inputFields, outputFields, pos) {
		// Add html block to Node container.
		var nodeContainer = $("#" + nodesContainerHtmlId);
		var htmlBlock = $("<div>", {
			id: nodesHtmlId + id,
			class: "jtk-node node-block " + nodesBlockCls+name
		});
		htmlBlock.append("<p class='node-title'>"+name+"</p>");
		htmlBlock.offset(pos);
		nodeContainer.append(htmlBlock);
		plumb.setContainer(nodeContainer);

		// Register output Endpoints.
		const height = htmlBlock.innerHeight();
		var offset = ((37 + 13) / height);
		var ostep = 26.5 / height;
		var field;
		var innerBlock = $("<div>", {class: "node-out-ports"});
		for (var i = 0; i < outputFields.length; ++i) {
			field = outputFields[i];
			innerBlock.append("<p class='node-out-field-label' for='out-"+field.name+"'>"+field.name+"</p>");
			defaults.sourceProperties.overlays[0][1].label = field.name;
			plumb.addEndpoint(nodesHtmlId + id, defaults.sourceProperties, {
				anchor: [1.0, offset, 0.6, 0],
				uuid: id + nodesOutSep + field.name
			});
			offset += ostep;
		}
		htmlBlock.append(innerBlock);

		// Register input Endpoints.
		var innerBlock = $("<div>", {class: "node-in-ports"});
		for (var i = 0; i < inputFields.length; ++i) {
			field = inputFields[i];
			var label = $("<p class='node-in-field-label'>"+field.name+"</p>");
			innerBlock.append(label);
			if (field.type != "ships") {
				if (field.choices.length == 0) {
					innerBlock.append($("<input>", {
						id: field.name,
						class: nodesConstInputCls,
						type: "text",
						name: field.name,
						value: field.data
					}));
				} else {
					var selector = $("<select>", {
						id: field.name,
						class: nodesConstInputCls
					});
					for (var choice of field.choices) {
						if (choice != null) {
							selector.append("<option value='"+choice+"'>"+choice+"</option>");
						} else {
							selector.append("<option value='null'>any</option>");
						}
					}
					innerBlock.append(selector);
				}
				ostep = 56 / height;
			} else {
				label.attr("style", "margin-bottom: 20px");
				ostep = 36 / height;
			}

			defaults.targetProperties.overlays[0][1].label = field.name;
			plumb.addEndpoint(nodesHtmlId + id, defaults.targetProperties, {
				anchor: [0.0, offset, -0.6, 0],
				uuid: id + nodesInSep + field.name
			});
			offset += ostep;
		}
		htmlBlock.append(innerBlock);

		plumb.draggable(htmlBlock, {containment: true});
		return {
			id: id,
			name: name,
			htmlBlock: htmlBlock,
			enableInput(name) {
				var inner = this.htmlBlock.children().filter(".node-in-ports");
				$.each(inner.children().filter("."+nodesConstInputCls+"#"+name), function(i, el) {
					$(el).removeAttr("disabled");
				});
			},
			disableInput(name) {
				var inner = this.htmlBlock.children().filter(".node-in-ports");
				$.each(inner.children().filter("."+nodesConstInputCls+"#"+name), function(i, el) {
					$(el).attr("disabled", true);
					$(el).val(null);
				});
			},
			getValues: function() {
				var values = [];
				var inner = this.htmlBlock.children().filter(".node-in-ports");
				$.each(inner.children().filter("input."+nodesConstInputCls), function(i, el) {
					var val = el.value;
					values.push({name: el.id, data: (val.length > 0) ? val : null});
				});
				$.each(inner.children().filter("select."+nodesConstInputCls), function(i, el) {
					var val = $(el).val();
					values.push({name: el.id, data: (val != "null") ? val : null});
				});
				return values;
			},
			setValues(values) {
				var inner = this.htmlBlock.children().filter(".node-in-ports");
				$.each(inner.children().filter("input."+nodesConstInputCls), function(i, el) {
					for (var pair of values) {
						if (pair.name == el.id) {
							el.value = pair.data;
							return;
						}
					}
				});
				$.each(inner.children().filter("select."+nodesConstInputCls), function(i, el) {
					for (var pair of values) {
						if (pair.name == el.id) {
							$(el).val((pair.data != null) ? pair.data : "null");
							return;
						}
					}
				});
			},
			getPosition() {
				return this.htmlBlock.offset();
			}
		};
	}
};

var NodeEditor = function(plumb) {
	return {
		ready: true,
		cfg: nodes,
		plumb: plumb,
		nodes: [],
		links: [],
		idCntr: 0,
		createNode: function(name, pos) {
			if (!this.ready) {
				alert("Sorry, cfg hasn't been loaded yet!");
				return;
			}

			if (!this.cfg.hasOwnProperty(name)) {
				console.error(`Unknown node name: ${name}`);
				return null;
			}

			var node = new Node.Block(
				this.plumb,
				this.idCntr,
				name,
				this.cfg[name].inputs,
				this.cfg[name].outputs,
				pos
			);
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
			var targetIdx = this.indexNode(tid);
			if ((this.indexNode(sid) == -1)
					|| (targetIdx == -1)) {
				return false;
			}

			var lnk = new Node.Link(sid, sp, tid, tp);
			if (this.indexLink(lnk) != -1) {
				return false;
			}

			console.log(`Linking: ${sid}-${sp} --> ${tid}-${tp}`);
			this.links.push(lnk);
			this.nodes[targetIdx].disableInput(tp);
			return true;
		},
		removeLink(sid, sp, tid, tp) {
			var targetIdx = this.indexNode(tid);
			if ((this.indexNode(sid) == -1)
					|| (targetIdx == -1))
				return false;

			var idx = this.indexLink(new Node.Link(sid, sp, tid, tp));
			if (idx == -1)
				return false;

			console.log(`Unlinking: ${sid}-${sp} --> ${tid}-${tp}`);
			this.links.splice(idx, 1);
			this.nodes[targetIdx].enableInput(tp);
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
			var node;
			for (var row of data.nodes) {
				node = this.createNode(row.name, row.position);
				node.setValues(row.inputs);
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
			var data = {
				nodes: this.nodes.map(function(node) {
					return {
						id: node.id,
						name: node.name,
						position: node.getPosition(),
						inputs: node.getValues()
					};
				}),
				links: this.links
			}
			return JSON.stringify(data);
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
