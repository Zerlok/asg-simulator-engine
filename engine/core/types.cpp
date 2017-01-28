#include <sstream>
#include "types.hpp"
#include "common/utils.hpp"


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


DataHolder::DataHolder() {}
DataHolder::DataHolder(const Units& units1, const Units& units2)
	: self_units(units1),
	  enemy_units(units2) {}
DataHolder::DataHolder(const DataHolder& data)
	: self_units(data.self_units),
	  enemy_units(data.enemy_units) {}
DataHolder::DataHolder(DataHolder&& data)
	: self_units(std::move(data.self_units)),
	  enemy_units(std::move(data.enemy_units)) {}


Units& DataHolder::get_ships(const BattleSide& side)
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


DataHolder& DataHolder::operator=(const DataHolder& data)
{
	self_units = data.self_units;
	enemy_units = data.enemy_units;

	return (*this);
}


Units& DataHolder::operator[](const BattleSide& side)
{
	return get_ships(side);
}


void DataHolder::clear()
{
	self_units.clear();
	enemy_units.clear();
}


void DataHolder::swap_sides()
{
	self_units.swap(enemy_units);
}

