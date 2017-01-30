"use strict"


var Tree = function(value) {
	return {
		data: [[value]],
		find: function(value) {
			var i, l;
			for (l = this.data.length-1; l >= 0; --l) {
				i = this.data[l].indexOf(value);
				if (i != -1)
					return {level: l, idx: i};
			}
			return {level: -1, idx: -1};
		},
		remove: function(pos) {
			if (pos.level >= 0)
				this.data[pos.level].splice(pos.idx, 1);
		},
		insert: function(level, value) {
			for (var i = level - this.data.length; i >= 0; --i)
				this.data.push([]);
			this.data[level].push(value);
		}
	};
};


var Iterator = function(begin, speed) {
	return {
		queue: [begin],
		data: null,
		cntr: 0,
		next: function() {
			++this.cntr;
			if ((this.cntr % speed) == 0) {
				this.data = this.queue.splice(0, 1)[0];
			} else {
				this.data = null;
			}
			return this.data;
		},
		equals: function(it) {
			if (this.queue.length != it.queue.length)
				return false;
			for (var i = 0; i < this.queue.length; ++ i)
				if (this.queue[i] != it.queue[i])
					return false;
			return (this.data == it.data);
		},
		index: function(value) {
			return this.queue.indexOf(value);
		},
		push: function(value) {
			this.queue.push(value);
			return this.queue.length;
		},
		uniquePush: function(value) {
			if (this.index(value) == -1) {
				return this.push(value);
			}
			return -1;
		}
	}
};


module.exports = {
	Tree: Tree,
	Iterator: Iterator
};
