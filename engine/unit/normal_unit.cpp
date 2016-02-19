#include <sstream>
#include "normal_unit.h"


Range<size_t> NormalUnit::default_damage = Range<size_t>(1, 4);
int NormalUnit::default_armor = 10;


NormalUnit::NormalUnit(const Point& pos)
	: AbstractUnit(pos, default_damage, default_armor)
{
}


NormalUnit::NormalUnit(const Arguments& args)
	: AbstractUnit(Point::zero, default_damage, default_armor)
{
	std::stringstream ss(args[0]);
	ss >> _pos;
}


NormalUnit::NormalUnit(const NormalUnit& unit)
	: AbstractUnit(unit)
{
}


NormalUnit::NormalUnit(NormalUnit&& unit)
	: AbstractUnit(std::move(unit))
{
}


NormalUnit::~NormalUnit()
{
}

