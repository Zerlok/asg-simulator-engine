#include "unit/fighter_unit.h"


FighterUnit::FighterUnit(const Point& pos)
	: AbstractUnit(pos, &FighterUnitStats)
{
}

FighterUnit::FighterUnit(const Arguments& args)
	: AbstractUnit(Point::zero, &FighterUnitStats)
{
}

FighterUnit::FighterUnit(const FighterUnit& unit)
	: AbstractUnit(unit)
{
}

FighterUnit::FighterUnit(FighterUnit&& unit)
	: AbstractUnit(std::move(unit))
{
}

FighterUnit::~FighterUnit()
{
}

