#include <sstream>
#include "test_unit.h"


TestUnit::TestUnit(const Point& pos)
	: AbstractUnit(pos, TestUnitStats)
{
}


TestUnit::TestUnit(const Arguments& args)
	: AbstractUnit(Point::zero, TestUnitStats)
{
	std::stringstream ss(args[0]);
	ss >> _pos;
}


TestUnit::TestUnit(const TestUnit& unit)
	: AbstractUnit(unit)
{
}


TestUnit::TestUnit(TestUnit&& unit)
	: AbstractUnit(std::move(unit))
{
}


TestUnit::~TestUnit()
{
}


