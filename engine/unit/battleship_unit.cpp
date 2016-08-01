#include "unit/battleship_unit.h"


BattleshipUnit::BattleshipUnit(const Point& pos)
	: AbstractUnit(pos, BattleshipUnitStats)
{
}

BattleshipUnit::BattleshipUnit(const Arguments& args)
	: AbstractUnit(Point::zero, BattleshipUnitStats)
{
}

BattleshipUnit::BattleshipUnit(const BattleshipUnit& unit)
	: AbstractUnit(unit)
{
}

BattleshipUnit::BattleshipUnit(BattleshipUnit&& unit)
	: AbstractUnit(std::move(unit))
{
}

BattleshipUnit::~BattleshipUnit()
{
}
