#ifndef __NORMAL_UNIT_H__
#define __NORMAL_UNIT_H__


#include "core/coretypes.h"
#include "abstract_unit.h"


class NormalUnit : public AbstractUnit
{
	public:
		static Range<size_t> default_damage;
		static int default_armor;

		NormalUnit(const Point& pos = Point::zero);
		NormalUnit(const Arguments& args);
		NormalUnit(const NormalUnit& unit);
		NormalUnit(NormalUnit&& unit);
		~NormalUnit();
};

#endif // __NORMAL_UNIT_H__
