#ifndef __NORMAL_UNIT_H__
#define __NORMAL_UNIT_H__


#include "core/types.h"
#include "abstract_unit.h"

const UnitStats NormalUnitStats =
{
	/* max_hp =  */				1000,
	/* max_shield =  */			1000,

	/* shield_regen = */		Range<size_t>(1, 2),
	/* damage = */				Range<size_t>(1, 10),
	/* velocity = */			Range<size_t>(2, 3),
	/* acc = */					Range<size_t>(80, 95),
	/* dodge = */				Range<size_t>(1, 10),

	/* attacking_coeff =  */	50,
	/* moving_coeff =  */		50,
	/* holding_coeff =  */		150
};

class NormalUnit : public AbstractUnit
{
	public:
		NormalUnit(const Point& pos = Point::zero);
		NormalUnit(const Arguments& args);
		NormalUnit(const NormalUnit& unit);
		NormalUnit(NormalUnit&& unit);
		~NormalUnit();
};


#endif // __NORMAL_UNIT_H__
