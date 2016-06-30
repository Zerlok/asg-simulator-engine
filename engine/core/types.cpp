#include <sstream>
#include "types.h"


std::ostream&operator<<(std::ostream& out, const BattleSide& side)
{
	switch (side)
	{
		case (BattleSide::self):
			out << "[SELF]";
			break;

		case (BattleSide::enemy):
			out << "[ENEMY]";
			break;

		default:
			out << "[UNKNOWN]";
			break;
	}

	return out;
}
std::istream&operator>>(std::istream& in, BattleSide& side)
{
	char c;
	std::stringstream ss;

	in >> c;
	if (c != '[')
		return in;

	in >> c;
	while (c != ']')
	{
		ss << c;
		in >> c;
	}

	if (ss.str().compare("[ENEMY]") == 0)
		side = BattleSide::enemy;
	else
		side = BattleSide::self;

	return in;
}


Battlefield::Battlefield() {}
Battlefield::Battlefield(const Units& units1, const Units& units2)
	: self_units(units1),
	  enemy_units(units2) {}
Battlefield::Battlefield(const Battlefield& data)
	: self_units(data.self_units),
	  enemy_units(data.enemy_units) {}
Battlefield::Battlefield(Battlefield&& data)
	: self_units(std::move(data.self_units)),
	  enemy_units(std::move(data.enemy_units)) {}


Units&Battlefield::get_units(const BattleSide& side)
{
	switch (side)
	{
		case (BattleSide::enemy):
			return enemy_units;

		case (BattleSide::self):
		default:
			return self_units;
	}
}


Battlefield& Battlefield::operator=(const Battlefield& data)
{
	self_units = data.self_units;
	enemy_units = data.enemy_units;

	return (*this);
}


Battlefield& Battlefield::operator+=(const Battlefield& data)
{
	self_units.insert(
			self_units.end(),
			data.self_units.begin(),
			data.self_units.end()
	);
	enemy_units.insert(
			enemy_units.end(),
			data.enemy_units.begin(),
			data.enemy_units.end()
	);

	return (*this);
}


Units& Battlefield::operator[](const BattleSide& side)
{
	return get_units(side);
}


void Battlefield::clear()
{
	self_units.clear();
	enemy_units.clear();
}


void Battlefield::swap_battle_sides()
{
	self_units.swap(enemy_units);
}


Player::Player(const Units& units, const Nodes& strategy)
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
