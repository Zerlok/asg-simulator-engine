#include "unit/unit_stats.h"


bool operator==(const UnitStats& first, const UnitStats& second)
{
	return first.max_health == second.max_health &&
		first.max_shield == second.max_shield &&
		first.shield_regen.get_max_value() == second.shield_regen.get_max_value() &&
		first.shield_regen.get_min_value() == second.shield_regen.get_min_value() &&
		first.damage.get_max_value() == second.damage.get_max_value() &&
		first.damage.get_min_value() == second.damage.get_min_value() &&
		first.velocity.get_max_value() == second.velocity.get_max_value() &&
		first.velocity.get_min_value() == second.velocity.get_min_value() &&
		first.acc.get_max_value() == second.acc.get_max_value() &&
		first.acc.get_min_value() == second.acc.get_min_value() &&
		first.dodge.get_max_value() == second.dodge.get_max_value() &&
		first.dodge.get_min_value() == second.dodge.get_min_value() &&
		first.attacking_coeff == second.attacking_coeff &&
		first.moving_coeff == second.moving_coeff &&
		first.holding_coeff == second.holding_coeff;
}
