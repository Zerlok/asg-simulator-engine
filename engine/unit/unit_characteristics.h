#ifndef UNIT_CHARACTERISTICS_H
#define UNIT_CHARACTERISTICS_H

#include "common/point.h"
#include "common/range.h"


struct UnitStats
{
	int HP; // hit points
	int SP; // shield points
	int SP_regen;
	Range<size_t> damage;
	int velocity;
	int acc;
	int move_acc;
	int dodge;
	int move_dodge;
};


#endif // UNIT_CHARACTERISTICS_H

