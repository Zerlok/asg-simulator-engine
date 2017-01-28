#ifndef BATTLESHIP_UNIT_H
#define BATTLESHIP_UNIT_H


#include "core/types.hpp"
#include "abstract_unit.h"


const static UnitStats BattleshipUnitStats =
{
	/* max_hp =  */				1000,
	/* max_shield =  */			500,

	/* shield_regen = */		Range<size_t>(50, 60),
	/* damage = */				Range<size_t>(90, 100),
	/* velocity = */			Range<size_t>(2, 3),
	/* acc = */					Range<size_t>(80, 95),
	/* dodge = */				Range<size_t>(1, 10),

	/* attacking_coeff =  */	50,
	/* moving_coeff =  */		50,
	/* holding_coeff =  */		150
};

class BattleshipUnit : public AbstractUnit
{
	public:
		BattleshipUnit(const Point& pos = Point::zero);
		BattleshipUnit(const Arguments& args);
		BattleshipUnit(const BattleshipUnit& unit);
		BattleshipUnit(BattleshipUnit&& unit);
		~BattleshipUnit();
};


#endif // BATTLESHIP_UNIT_H

