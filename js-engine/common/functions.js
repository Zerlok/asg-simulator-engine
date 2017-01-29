"use strict"


function clamp(a, b, c) {
	return Math.max(a, Math.min(b, c));
}


function countable(x) {
	if (Array.isArray(x)) {
		return x.length;
	} else if (x == null) {
		return 0;
	} else {
		return x;
	}
}


function appender(obj, fields, generators) {
	for (var i = 0; i < fields.length; ++i) {
		var name = fields[i];
		var fieldGen = generators[name];
		if (fieldGen)
			obj[name] = fieldGen(i, name);
	}
	return obj;
}


function builder(fields, generators) {
	return appender({}, fields, generators);
}


const operators = {
	names: ['eq', 'ne', 'lt', 'gt', 'le', 'ge', 'and', 'or', 'xor'],
	eq: function(a, b) { return (countable(a) == countable(b)); },
	ne: function(a, b) { return (countable(a) != countable(b)); },
	lt: function(a, b) { return (countable(a) < countable(b)); },
	gt: function(a, b) { return (countable(a) > countable(b)); },
	le: function(a, b) { return (countable(a) <= countable(b)); },
	ge: function(a, b) { return (countable(a) >= countable(b)); },
	and: function(a, b) { return (countable(a) && countable(b)); },
	or: function(a, b) { return (countable(a) || countable(b)); },
	xor: function(a, b) {
		var x = countable(a);
		var y = countable(b);
		return ((x && !y) || (!x && y));
	}
}


module.exports = {
	clamp: clamp,
	countable: countable,
	operators: operators,
	objects: {
		appender: appender,
		builder: builder
	}
};
