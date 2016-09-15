#ifndef __SIMULATOR_H__
#define __SIMULATOR_H__


#include "core/types.h"
#include "core/factories.h"


class NodeSimulator
{
	public:
		// Static.
		static NodeFactory initialize_node_factory();
		static void initialize_node_factory(NodeFactory& node_factory);
		static void initialize_unit_factory(UnitFactory& unit_factory);

		// Constructor / Destructor.
		NodeSimulator();
		~NodeSimulator();

		// Getters.
		const UnitFactory& get_unit_factory() const;
		const NodeFactory& get_node_factory() const;

		// Methods.
		void run(const std::string& attacker_units_filename,
				 const std::string& attacker_strategy_filename,
				 const std::string& defender_units_filename,
				 const std::string& defender_strategy_filename);
		void run(Player& attacker, Player& defender);

		Player init_player(const std::string& units_filename,
						   const std::string& strategy_filename);

	private:
		// No copy constructors.
		NodeSimulator(const NodeSimulator& simulator);
		NodeSimulator& operator=(const NodeSimulator& simulator);

		void _print_player_units(const Player& player) const;

		// Fields.
		UnitFactory _unit_factory;
		NodeFactory _node_factory;
};


// __BATTLESIMULATOR_H__
#endif
