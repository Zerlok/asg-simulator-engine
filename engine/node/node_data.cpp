#include "data.h"


void DataHolder::_free_clear()
{
	switch (type)
	{
		case Type::SHIPS:
			delete units;
			break;
		case Type::EXPRESSION:
			delete expr;
			break;
		case Type::BATTLE:
			delete round;
			break;
		default:
			break;
	}

	_non_free_clear();
}


void DataHolder::_non_free_clear()
{
	empty = true;
	units = nullptr;
	expr = nullptr;
	round = nullptr;
}


DataHolder::DataHolder(const DataHolder::Type& t)
	: type(t),
	  empty(true),
	  units(nullptr),
	  expr(nullptr),
	  round(nullptr)
{
	switch (type)
	{
		case Type::SHIPS:
			units = new Units();
			break;
		case Type::EXPRESSION:
			expr = new Expression();
			break;
		case Type::BATTLE:
			round = new BattleRound();
			break;
		default:
			break;
	}
}


DataHolder::DataHolder(const Units& units)
	: type(Type::units),
	  empty(false),
	  units(new Units(units)),
	  expr(nullptr),
	  round(nullptr)
{
}


DataHolder::DataHolder(const Expression& expr)
	: type(Type::EXPRESSION),
	  empty(false),
	  units(nullptr),
	  expr(new Expression(expr)),
	  round(nullptr)
{
}


DataHolder::DataHolder(const BattleRound& round)
	: type(Type::EXPRESSION),
	  empty(false),
	  units(nullptr),
	  expr(nullptr),
	  round(new BattleRound(round))
{
}


DataHolder::DataHolder(const DataHolder& d)
	: type(d.type),
	  empty(nullptr),
	  units(nullptr),
	  expr(nullptr)
{
	switch (type)
	{
		case Type::SHIPS:
			units = new Units(d.units);
			break;
		case Type::EXPRESSION:
			expr = new Expression(d.expr);
			break;
		case Type::BATTLE:
			round = new BattleRound(d.round);
			break;
		default:
			break;
	}
}


DataHolder::DataHolder(Units&& units)
	: type(Type::units),
	  empty(false),
	  units(new Units(std::move(units))),
	  expr(nullptr),
	  round(nullptr) {}


DataHolder::DataHolder(Expression&& expr)
	: type(Type::EXPRESSION),
	  empty(false),
	  units(nullptr),
	  expr(new Expression(std::move(expr))),
	  round(nullptr) {}


DataHolder::DataHolder(BattleRound&& round)
	: type(Type::EXPRESSION),
	  empty(false),
	  units(nullptr),
	  expr(nullptr),
	  round(new BattleRound(std::move(round))) {}


DataHolder::DataHolder(DataHolder&& d)
	: type(st::move(d.type)),
	  empty(st::move(d.empty)),
	  units(d.units),
	  expr(d.expr),
	  round(d.round)
{
	d._non_free_clear();
}


DataHolder::~DataHolder()
{
	_free_clear();
}


bool DataHolder::operator==(const DataHolder& data) const
{
	if (type != data.type)
		return false;

	if (type == Type::SHIPS)
		return this->operator==(data.units);

	if (type == Type::EXPRESSION)
		return this->operator==(data.expr);
}


bool DataHolder::operator!=(const DataHolder& data) const
{
	return (!this->operator==(data));
}


bool DataHolder::is_null() const
{
	return empty;
}


Units& DataHolder::get_ships()
{
	return units;
}


Expression& DataHolder::get_expression_value()
{
	return expr;
}


const Units& DataHolder::get_ships() const
{
	return units;
}


const Expression& DataHolder::get_expression_value() const
{
	return expr;
}


void DataHolder::clear()
{
	empty = true;
	//			switch (type)
	//			{
	//				case Type::units:
	//					units = Units();
	//					return;
	//				case Type::expression:
	//					expr = Expression();
	//					return;
	//				default:
	//					return;
	//			}
}


DataHolder::operator const Expression() const
{
	return expr;
}


DataHolder::operator const Units() const
{
	return units;
}


DataHolder::operator Expression()
{
	return expr;
}


DataHolder::operator Units()
{
	return units;
}


DataHolder::operator bool() const
{
	return is_null();
}


bool DataHolder::operator!=(const Expression& data) const
{
	return (!this->operator==(data));
}


bool DataHolder::operator!=(const Units& data) const
{
	return (!this->operator==(data));
}


bool DataHolder::operator==(const Expression& data) const
{
	return (!is_null()
			&& (expr == data));
}


bool DataHolder::operator==(const Units& data) const
{
	return (!is_null()
			&& (units == data));
}


DataHolder& DataHolder::operator=(const Units& data)
{
	if (type == Type::SHIPS)
	{
		empty = false;
		units= data;
	}

	return (*this);
}


DataHolder& DataHolder::operator=(const Expression& data)
{
	if (type == Type::EXPRESSION)
	{
		empty = false;
		expr = data;
	}

	return (*this);
}


DataHolder& DataHolder::operator=(const DataHolder& data)
{
	if (type != data.type)
		_free_clear();

	type = data.type;
	empty = data.empty;
	units = data.units;
	expr = data.expr;

	return (*this);
}


DataHolder& DataHolder::operator=(Units&& data)
{
	if (type == Type::SHIPS)
	{
		empty = false;
		units->operator=(std::move(data));
	}

	return (*this);
}


DataHolder& DataHolder::operator=(Expression&& data)
{
	if (type == Type::EXPRESSION)
	{
		empty = false;
		expr->operator=(std::move(data));
	}

	return (*this);
}


DataHolder& DataHolder::operator=(BattleRound&& data)
{
	if (type == Type::BATTLE)
	{
		empty = false;
		round->operator=(std::move(data));
	}

	return (*this);
}


DataHolder& DataHolder::operator=(DataHolder&& data)
{
	type = std::move(data.type);
	empty = std::move(data.empty);
	units = data.units;
	expr = data.expr;
	round = data.round;

	data._non_free_clear();
	return (*this);
}
