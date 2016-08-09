#include <sstream>
#include "normal_unit.h"


NormalUnit::NormalUnit(const Point& pos)
	: AbstractUnit(pos, &NormalUnitStats)
{
}


NormalUnit::NormalUnit(const Arguments& args)
	: AbstractUnit(Point::zero, &NormalUnitStats)
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

