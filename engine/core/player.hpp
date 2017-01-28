#ifndef __PLAYER_HPP__
#define __PLAYER_HPP__


#include "unit/abstract_unit.h"
#include "node/abstract.hpp"


class Player
{
	public:
		// Constructors / Destructor.
		Player(const Units& units = Units(),
			   const Nodes& strategy = Nodes());
		Player(const Player& player);
		Player(Player&& player);
		~Player();

		// Methods.
		bool is_valid() const;

		// Fields.
		Units units;
		Nodes strategy;
};


// __PLAYER_HPP__
#endif
