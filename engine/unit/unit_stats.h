#ifndef UNIT_STATS_H
#define UNIT_STATS_H

#include "common/range.hpp"

struct UnitStats
{
	// Max HP and shield values.
	int max_health;
	int max_shield;
	// Ranges.
	Range<size_t> shield_regen;
	Range<size_t> damage;
	Range<size_t> velocity;
	Range<size_t> acc;
	Range<size_t> dodge;
	// Status' affects.
	int attacking_ratio; // for velocity, %
	int moving_ratio; // for accuracy and dodge, %
	int holding_ratio; // for set shield regen on, %
};

bool operator==(const UnitStats& first, const UnitStats& second);

#endif // UNIT_STATS_H

