#ifndef __SIMULATOR_H__
#define __SIMULATOR_H__


#include "coretypes.h"
#include "factories.h"


class Simulator
{
	public:
		// Constructor / Destructor.
		Simulator();
		~Simulator();

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
		Simulator(const Simulator& simulator);
		Simulator& operator=(const Simulator& simulator);

		void _print_player_units(const Player& player) const;

		// Fields.
		UnitFactory _unit_factory;
		NodeFactory _node_factory;
};


// __BATTLESIMULATOR_H__
#endif
