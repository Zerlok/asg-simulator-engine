#include "abstract_unit.h"


AbstractUnit::AbstractUnit(const Point& pos, const Range<size_t>& damage_range, const int armor)
	: _pos(pos),
	  _damage_range(damage_range),
	  _armor(armor)
{
}


AbstractUnit::AbstractUnit(const AbstractUnit& unit)
	: _pos(unit._pos),
	  _damage_range(unit._damage_range),
	  _armor(unit._armor)
{
}


AbstractUnit::AbstractUnit(AbstractUnit&& unit)
	: _pos(std::move(unit._pos)),
	  _damage_range(std::move(unit._damage_range)),
	  _armor(std::move(unit._armor))
{
}


AbstractUnit::~AbstractUnit()
{
}


size_t AbstractUnit::fire()
{
	return (is_alive()
			? _damage_range.get_value()
			: 0);
}


void AbstractUnit::receive_damage(const int dmg)
{
	if (!is_alive())
		return;

	_armor -= dmg;
}


void AbstractUnit::move_to(const Point &pos)
{
	if (!is_alive())
		return;

	_pos = pos;
}


void AbstractUnit::hold()
{
	static Range<int> shield_range = Range<int>(1);

	if (!is_alive())
		return;

	_armor += shield_range.get_value();
}


bool AbstractUnit::is_alive() const
{
	return (_armor > 0);
}


const Range<size_t>& AbstractUnit::get_damage_range() const
{
	return _damage_range;
}


int AbstractUnit::get_armor() const
{
	return _armor;
}


const Point& AbstractUnit::get_position() const
{
	return _pos;
}
