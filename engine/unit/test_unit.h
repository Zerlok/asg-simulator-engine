#ifndef TEST_UNIT_H
#define TEST_UNIT_H

#include <gtest/gtest.h>

#include "core/types.hpp"
#include "abstract_unit.h"

const static UnitStats TestUnitStats =
{
	/* max_hp =  */				1000,
	/* max_shield =  */			1000,

	/* shield_regen = */		Range<size_t>(100, 200),
	/* damage = */				Range<size_t>(100, 150),
	/* velocity = */			Range<size_t>(5, 10),
	/* acc = */					Range<size_t>(80, 95),
	/* dodge = */				Range<size_t>(50, 100),

	/* attacking_coeff =  */	50,
	/* moving_coeff =  */		50,
	/* holding_coeff =  */		150
};

class TestUnit : public AbstractUnit
{
	public:
		TestUnit(const Point& pos = Point::zero);
		TestUnit(const Arguments& args);
		TestUnit(const TestUnit& unit);
		TestUnit(TestUnit&& unit);
		~TestUnit();

		FRIEND_TEST(Unit, AbstractUnit);
		FRIEND_TEST(Unit, TestUnit);
};


#endif // TEST_UNIT_H

