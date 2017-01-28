#include "player.hpp"


Player::Player(const Units& units,
			   const Nodes& strategy)
	: units(units),
	  strategy(strategy)
{
}


Player::Player(const Player& player)
	: units(player.units),
	  strategy(player.strategy)
{
}


Player::Player(Player&& player)
	: units(std::move(player.units)),
	  strategy(std::move(player.strategy))
{
}


Player::~Player()
{
	for (AbstractUnit* unit : units)
		delete unit;

	for (AbstractNode* node : strategy)
		delete node;
}


bool Player::is_valid() const
{
	return (!units.empty()
			&& !strategy.empty());
}
