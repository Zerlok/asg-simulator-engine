#include "abstract_unit.h"

/*
 * TO DO:
 * Find a way how to manage status field more carefuly:
 * how and when to add attacking and moving stauses.
 * Now moving and attacking actions perform instantly.
 *
 * Add path calculation and other moving stuff.
*/

AbstractUnit::AbstractUnit(const Point& pos, const UnitStats& class_stats)
	: _class_stats(class_stats),
	  _pos(pos),
	  _health(class_stats.max_health),
	  _shield(class_stats.max_shield)
{
}


AbstractUnit::AbstractUnit(const AbstractUnit& unit)
	: _class_stats(unit._class_stats),
	  _pos(unit._pos),
	  _health(unit._health),
      _shield(unit._shield)
{
}


AbstractUnit::AbstractUnit(AbstractUnit&& unit)
	: _class_stats(std::move(unit._class_stats)),
	  _pos(std::move(unit._pos)),
	  _health(std::move(unit._health)),
      _shield(std::move(unit._shield))
{
}


AbstractUnit::~AbstractUnit()
{
}


size_t AbstractUnit::fire()
{
	_status.erase(Holding);
	_status.insert(Attacking);

	// See TO DO.

	_status.erase(Attacking);
	_status.insert(Holding);

	return (is_alive()
			? calculate_damage()
			: 0);
}


void AbstractUnit::receive_damage(const int dmg)
{
	if (!is_alive())
		return;

	int hp_loss = _shield - dmg;
	if (hp_loss < 0)
	{
		_shield = 0;
		_health -= hp_loss;
	} else
	{
		_shield -= dmg;
	}
}


void AbstractUnit::move_to(const Point &pos)
{
	if (!is_alive())
		return;

	_status.erase(Holding);
	_status.insert(Moving);

	/*
	 * See TO DO:
	*/

	_pos = pos;

	_status.erase(Moving);
	_status.insert(Holding);
}


void AbstractUnit::hold()
{
	if (!is_alive())
		return;

	_status.erase(Moving);
	_status.insert(Holding);

	_shield += calculate_shield_regen();
}


bool AbstractUnit::is_alive() const
{
	return (_health > 0);
}


const Range<size_t>& AbstractUnit::get_damage_range() const
{
	return _class_stats.damage;
}


int AbstractUnit::get_health() const
{
	return _health;
}


const Point& AbstractUnit::get_position() const
{
	return _pos;
}

int AbstractUnit::calculate_shield_regen() const
{
	return _class_stats.shield_regen.get_value();
}

int AbstractUnit::calculate_damage() const
{
	return _class_stats.damage.get_value();
}

int AbstractUnit::calculate_velocity() const
{
	bool attacking = _status.find(Attacking) != _status.end();
	return attacking ?
		int(_class_stats.velocity.get_value() * _class_stats.attacking_coeff / 100) :
		_class_stats.velocity.get_value();
}

int AbstractUnit::calculate_accuracy() const
{
	bool moving = _status.find(Moving) != _status.end();
	return moving ?
		int(_class_stats.acc.get_value() * _class_stats.moving_coeff / 100) :
		_class_stats.acc.get_value();
}

int AbstractUnit::calculate_dodge() const
{
	bool moving = _status.find(Moving) != _status.end();
	return moving ?
		int(_class_stats.dodge.get_value() * (100 - _class_stats.moving_coeff) / 100) :
		_class_stats.dodge.get_value();
}
