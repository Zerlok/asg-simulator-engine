"use strict"


class Factory {
	constructor() {
		this.creators = {};
	}

	registrate(name, Cls) {
		this.creators[name] = function(args) {
			args.splice(0, 0, null); // FIXME: if you don't do that, the first argument is missed in constructor.
			return new (Function.prototype.bind.apply(Cls, args));
		};
		// console.log(`${name} registered.`);
	}

	create() {
		if (arguments.length == 0) {
			console.error('No arguments were given to factory!');
			return null;
		}

		var name = arguments[0];
		if (!this.creators.hasOwnProperty(name)) {
			console.error(`Can't create unregistered class '${name}'!`);
			return null;
		}

		var args = [];
		for (var i = 1; i < arguments.length; ++i)
			args.push(arguments[i]);

		// console.log(`Factory creating '${name}' ...`);
		return this.creators[name](args);
	}

	createArgs(name, args) {
		if (name == null)
			return this.createArgs.apply(this, arguments);

		if (!Array.isArray(args)) {
			if (args == null) {
				args = [];
			} else {
				args = [args];
			}
		}
		args.splice(0, 0, name);
		return this.create.apply(this, args);
	}
}


module.exports = Factory;
