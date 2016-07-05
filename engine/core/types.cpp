#include <sstream>
#include "types.h"
#include "common/utils.h"


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

	const std::string s = ss.str();
	if (s == "[ENEMY]")
		side = BattleSide::enemy;
	else if (s == "[SELF]")
		side = BattleSide::self;

	return in;
}


NodeData::NodeData() {}
NodeData::NodeData(const Units& units1, const Units& units2)
	: self_units(units1),
	  enemy_units(units2) {}
NodeData::NodeData(const NodeData& data)
	: self_units(data.self_units),
	  enemy_units(data.enemy_units) {}
NodeData::NodeData(NodeData&& data)
	: self_units(std::move(data.self_units)),
	  enemy_units(std::move(data.enemy_units)) {}


Units& NodeData::get_units(const BattleSide& side)
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


NodeData& NodeData::operator=(const NodeData& data)
{
	self_units = data.self_units;
	enemy_units = data.enemy_units;

	return (*this);
}


Units& NodeData::operator[](const BattleSide& side)
{
	return get_units(side);
}


void NodeData::clear()
{
	self_units.clear();
	enemy_units.clear();
}


void NodeData::swap_sides()
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
