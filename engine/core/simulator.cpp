#include "unit/normal_unit.h"
#include "unit/unit_reader.h"
#include "node/root_node.h"
#include "node/end_node.h"
#include "node/cmd_move_node.h"
#include "node/cmd_hold_node.h"
#include "node/cmd_fire_node.h"
#include "node/units_select_node.h"
#include "node/node_reader.h"
#include "node/node_utils.h"
#include "simulator.h"


Simulator::Simulator()
{
	// Init unit factory.
	_unit_factory.registerate<NormalUnit>("normal");

	// Init node factory.
	_node_factory.registerate<RootNode>(AbstractNode::Type::root);
	_node_factory.registerate<EndNode>(AbstractNode::Type::end);
	_node_factory.registerate<CmdFireNode>(AbstractNode::Type::cmd_fire);
	_node_factory.registerate<CmdHoldNode>(AbstractNode::Type::cmd_hold);
	_node_factory.registerate<CmdMoveNode>(AbstractNode::Type::cmd_move);
	_node_factory.registerate<UnitsSelectNode>(AbstractNode::Type::units_select);

	Range<>::randomize();
}


Simulator::~Simulator()
{
}


const UnitFactory& Simulator::get_unit_factory() const
{
	return _unit_factory;
}


const NodeFactory& Simulator::get_node_factory() const
{
	return _node_factory;
}


void Simulator::run(
		const std::string& attacker_units_filename,
		const std::string& attacker_strategy_filename,
		const std::string& defender_units_filename,
		const std::string& defender_strategy_filename)
{
	// Read two files - build attacker and defender.
	Player attacker = init_player(attacker_units_filename, attacker_strategy_filename);
	Player defender = init_player(defender_units_filename, defender_strategy_filename);
	std::cout << "Players initialized." << std::endl;

	// Run simulator wiht two players.
	run(attacker, defender);

	std::cout << " ------ Battle result ------ " << std::endl;
	std::cout << "Attacker ships: " << std::endl;
	_print_player_units(attacker);
	std::cout << "Defender ships: " << std::endl;
	_print_player_units(defender);
}


void Simulator::run(Player& attacker, Player& defender)
{
	if (!attacker.is_valid()
			|| !defender.is_valid())
		return;

	// Execute attacker's and defender's schemes continiusly,
	// until battle result or max iterations num.
	Battlefield battle_data(attacker.units, defender.units);

	nodeutils::sort_by_levels(attacker.strategy);
	nodeutils::sort_by_levels(defender.strategy);

	Player* current_player = &attacker;
	Player* idle_player = &defender;

	// Make 6 steps by each player.
	for (int i = 0; i < 12; ++i)
	{
		RootNode* root = RootNode::cast(current_player->strategy.front());
		EndNode* end = EndNode::cast(current_player->strategy.back());

		root->set_data(battle_data);
		for (AbstractNode* node : current_player->strategy)
			node->execute();
		battle_data = end->get_data();

		// TODO: Check for battle end (no enemy ships left).

		std::cout << "Step: " << i << std::endl;
		std::cout << "Attacker ships: " << std::endl;
		_print_player_units(attacker);
		std::cout << "Defender ships: " << std::endl;
		_print_player_units(defender);
		std::cout << std::endl;

		// Swap sides.
		battle_data.swap_battle_sides();
		std::swap(current_player, idle_player);
	}

	std::cout << "Simulation finished!" << std::endl;
}


Player Simulator::init_player(
		const std::string& units_filename,
		const std::string& strategy_filename)
{
	Player player;

	UnitReader units_reader(units_filename, _unit_factory);
	NodeReader strategy_reader(strategy_filename, _node_factory);

	units_reader.read();
	strategy_reader.read();

	player.units = units_reader.get_units();
	player.strategy = strategy_reader.get_nodes();

	return std::move(player);
}


void Simulator::_print_player_units(const Player& player) const
{
	for (AbstractUnit* unit : player.units)
		std::cout << "Unit: "
				  << unit->get_armor() << " hp at "
				  << unit->get_position()
				  << std::endl;
}

