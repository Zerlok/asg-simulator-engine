#ifndef FIGHTER_UNIT_H
#define FIGHTER_UNIT_H


#include "core/types.hpp"
#include "abstract_unit.h"


const static UnitStats FighterUnitStats =
{
	/* max_hp =  */				800,
	/* max_shield =  */			500,

	/* shield_regen = */		Range<size_t>(25, 30),
	/* damage = */				Range<size_t>(70, 90),
	/* velocity = */			Range<size_t>(3, 5),
	/* acc = */					Range<size_t>(65, 70),
	/* dodge = */				Range<size_t>(15, 20),

	/* attacking_coeff =  */	50,
	/* moving_coeff =  */		50,
	/* holding_coeff =  */		150
};

class FighterUnit : public AbstractUnit
{
	public:
		FighterUnit(const Point& pos = Point::zero);
		FighterUnit(const Arguments& args);
		FighterUnit(const FighterUnit& unit);
		FighterUnit(FighterUnit&& unit);
		~FighterUnit();
};


#endif // FIGHTER_UNIT_H

