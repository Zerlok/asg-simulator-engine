#include <sstream>

#include "unit/normal_unit.h"
#include "unit/unit_reader.h"
#include "node/root_node.h"
#include "node/end_node.h"
#include "node/cmd_move_node.h"
#include "node/cmd_hold_node.h"
#include "node/cmd_fire_node.h"
#include "node/units_select_node.h"
#include "node/node_utils.h"
#include "editor/node_reader_writer.h"
#include "node_simulator.h"


NodeSimulator::NodeSimulator()
{
	// Init unit factory.
	_unit_factory.registerate<NormalUnit>("normal");

	// Init node factory.
	std::stringstream ss;

	// Basic nodes.
	ss << AbstractNode::Type::root;
	_node_factory.registerate<RootNode>(ss.str());
	ss.str("");
	ss << AbstractNode::Type::end;
	_node_factory.registerate<EndNode>(ss.str());
	ss.str("");

	// Command nodes.
	ss << AbstractNode::Type::cmd_fire;
	_node_factory.registerate<CmdFireNode>(ss.str());
	ss.str("");
	ss << AbstractNode::Type::cmd_hold;
	_node_factory.registerate<CmdHoldNode>(ss.str());
	ss.str("");
	ss << AbstractNode::Type::cmd_move;
	_node_factory.registerate<CmdMoveNode>(ss.str());
	ss.str("");

	// Unit nodes.
	ss << AbstractNode::Type::units_select;
	_node_factory.registerate<UnitsSelectNode>(ss.str());
	ss.str("");
}


NodeSimulator::~NodeSimulator()
{
}


const UnitFactory& NodeSimulator::get_unit_factory() const
{
	return _unit_factory;
}


const NodeFactory& NodeSimulator::get_node_factory() const
{
	return _node_factory;
}


void NodeSimulator::run(
		const std::string& attacker_units_filename,
		const std::string& attacker_strategy_filename,
		const std::string& defender_units_filename,
		const std::string& defender_strategy_filename)
{
	// Read two files - build attacker and defender.
	Player attacker = init_player(attacker_units_filename, attacker_strategy_filename);
	Player defender = init_player(defender_units_filename, defender_strategy_filename);

	std::cout << " ------ Players initialized ------" << std::endl;
	std::cout << "Attacker ships: " << std::endl;
	_print_player_units(attacker);
	std::cout << "Defender ships: " << std::endl;
	_print_player_units(defender);

	// Run simulator wiht two players.
	run(attacker, defender);

	std::cout << " ------ Battle result ------ " << std::endl;
	std::cout << "Attacker ships: " << std::endl;
	_print_player_units(attacker);
	std::cout << "Defender ships: " << std::endl;
	_print_player_units(defender);
}


void NodeSimulator::run(Player& attacker, Player& defender)
{
	if (!attacker.is_valid()
			|| !defender.is_valid())
		return;

	// Execute attacker's and defender's schemes continiusly,
	// until battle result or max iterations num.
	NodeData battle_data(attacker.units, defender.units);

	nodeutils::sort_by_levels(attacker.strategy);
	nodeutils::sort_by_levels(defender.strategy);

	Player* current_player = &attacker;
	Player* idle_player = &defender;

	// Make 6 steps by each player.
	for (int i = 0; i < 12; ++i)
	{
		RootNode* root = RootNode::cast(current_player->strategy.front());
//		EndNode* end = EndNode::cast(current_player->strategy.back());

		root->set_data(battle_data);
		for (AbstractNode* node : current_player->strategy)
			node->execute();
//		battle_data = end->get_data();

		// TODO: Check for battle end (no enemy ships left).

		std::cout << "Step: " << i << std::endl;
		std::cout << "Attacker ships: " << std::endl;
		_print_player_units(attacker);
		std::cout << "Defender ships: " << std::endl;
		_print_player_units(defender);
		std::cout << std::endl;

		// Swap sides.
		battle_data.swap_sides();
		std::swap(current_player, idle_player);
	}

	std::cout << "Simulation finished!" << std::endl;
}


Player NodeSimulator::init_player(
		const std::string& units_filename,
		const std::string& strategy_filename)
{
	Player player;

	UnitReader units_reader(_unit_factory);
	NodeReader strategy_reader(_node_factory);

	player.units = units_reader.read(units_filename);
	player.strategy = strategy_reader.read(strategy_filename);

	return std::move(player);
}


void NodeSimulator::_print_player_units(const Player& player) const
{
	for (AbstractUnit* unit : player.units)
		std::cout << "Unit: "
				  << unit->get_armor() << " hp at "
				  << unit->get_position()
				  << std::endl;
}

