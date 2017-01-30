var Simulator = require('./simulator');

module.exports = {
	config: require('../config').battle,
	logger: require('./logger'),
	Player: Simulator.Player,
	simulate: Simulator.simulateBattle
};
