#include "abstract_unit.h"

/*
 * TO DO:
 * Find a way how to manage status field more carefuly:
 * how and when to add attacking and moving stauses.
 * Now moving and attacking actions perform instantly.
 *
 * Add path calculation and other moving stuff.
*/

AbstractUnit::AbstractUnit(const Point& pos, const UnitStats* class_stats)
	: _class_stats(class_stats),
	  _pos(pos),
	  _health(class_stats->max_health),
	  _shield(class_stats->max_shield)
{
}


AbstractUnit::AbstractUnit(const AbstractUnit& unit)
	: _class_stats(unit._class_stats),
	  _pos(unit._pos),
	  _health(unit._class_stats->max_health),
      _shield(unit._class_stats->max_shield)
{
}


AbstractUnit::AbstractUnit(AbstractUnit&& unit)
	: _class_stats(unit._class_stats),
	  _pos(std::move(unit._pos)),
	  _health(std::move(unit._class_stats->max_health)),
      _shield(std::move(unit._class_stats->max_shield))
{
}


AbstractUnit::~AbstractUnit()
{
}


size_t AbstractUnit::fire()
{
	switch(_status)
	{
	case Status::holding:
		_status = Status::attacking_on_holding;
		break;
	case Status::moving:
		_status = Status::attacking_on_moving;
		break;
	default:
		break;
	}

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

	if (_pos == pos)
	{
		switch(_status)
		{
		case Status::moving:
			_status = Status::holding;
			break;
		case Status::attacking_on_moving:
			_status = Status::attacking_on_holding;
			break;
		default:
			break;
		}
	} else
	{
		switch(_status)
		{
		case Status::attacking_on_holding:
			_status = Status::attacking_on_moving;
			break;
		case Status::holding:
			_status = Status::moving;
			break;
		default:
			break;
		}

		int _x = _pos.get_x();
		int _y = _pos.get_y();
		int _z = _pos.get_z();
		int x = pos.get_x();
		int y = pos.get_y();
		int z = pos.get_z();

		if (_x != x)
			_pos += _x < x ? Point(1, 0, 0) : Point(-1, 0, 0);
		if (_y != y)
			_pos += _y < y ? Point(0, 1, 0) : Point(0, -1, 0);
		if (_z != z)
			_pos += _z < z ? Point(0, 0, 1) : Point(0, 0, -1);
	}
}


void AbstractUnit::hold()
{
	if (!is_alive())
		return;

	_status = Status::holding;

	_shield += calculate_shield_regen();
}


bool AbstractUnit::is_alive() const
{
	return (_health > 0);
}


const Range<size_t>& AbstractUnit::get_damage_range() const
{
	return _class_stats->damage;
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
	return _class_stats->shield_regen.get_value();
}

int AbstractUnit::calculate_damage() const
{
	return _class_stats->damage.get_value();
}

int AbstractUnit::calculate_velocity() const
{
	bool is_attacking = _status == Status::attacking_on_moving ||
						_status == Status::attacking_on_holding;
	return is_attacking ?
		_class_stats->velocity.get_value() * _class_stats->attacking_ratio / 100 :
		_class_stats->velocity.get_value();
}

int AbstractUnit::calculate_accuracy() const
{
	bool is_moving = _status == Status::attacking_on_moving ||
					 _status == Status::moving;
	return is_moving ?
		_class_stats->acc.get_value() * _class_stats->moving_ratio / 100 :
		_class_stats->acc.get_value();
}

int AbstractUnit::calculate_dodge() const
{
	bool is_moving = _status == Status::attacking_on_moving ||
					 _status == Status::moving;
	return is_moving ?
		_class_stats->dodge.get_value() * (100 - _class_stats->moving_ratio) / 100 :
		_class_stats->dodge.get_value();
}
