#ifndef __ABSTRACT_UNIT_H__
#define __ABSTRACT_UNIT_H__


#include <set>

#include "common/point.h"
#include "common/range.h"

#include "unit/unit_stats.h"

enum Action
{
	Attacking = 0,
	Moving,
	Holding
};

class AbstractUnit
{
	public:
		// Types.
		using Status = std::set<Action>;

		// Constructors / Destructor.
		AbstractUnit(const Point& pos, const UnitStats& class_stats);
		AbstractUnit(const AbstractUnit& unit);
		AbstractUnit(AbstractUnit&& unit);
		virtual ~AbstractUnit();

		// Battle methods.
		virtual size_t fire();
		virtual void receive_damage(const int dmg);
		virtual void move_to(const Point& pos);
		virtual void hold();

		// Getters.
		bool is_alive() const;

		const Range<size_t>& get_damage_range() const;
		int get_health() const;
		const Point& get_position() const;

		// Stats calculators (stats depend on Status).
		int calculate_shield_regen() const;
		int calculate_damage() const;
		int calculate_velocity() const;
		int calculate_accuracy() const;
		int calculate_dodge() const;

	protected:
		const UnitStats _class_stats;

		Point _pos;
		int _health;
		int _shield;
		Status _status = {Holding};
};


// __ABSTRACT_UNIT_H__
#endif
