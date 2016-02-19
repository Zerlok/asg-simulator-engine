#ifndef __ABSTRACT_UNIT_H__
#define __ABSTRACT_UNIT_H__


#include "common/point.h"
#include "common/range.h"


class AbstractUnit
{
	public:
		// Constructors / Destructor.
		AbstractUnit(const Point& pos, const Range<size_t>& damage_range, const int armor);
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
		int get_armor() const;
		const Point& get_position() const;

	protected:
		Point _pos;

		Range<size_t> _damage_range;
		int _armor;
};


// __ABSTRACT_UNIT_H__
#endif
