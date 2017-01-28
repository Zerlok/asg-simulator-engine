#ifndef __ABSTRACT_DATA_H__
#define __ABSTRACT_DATA_H__


#include "unit/abstract_unit.h"


class DataHolder
{
	public:
		enum class Type : char
		{
			NONE = 'n',
			OWN_UNITS = 'u',
			ENEMY_UNITS = 'e',
			EXPRESSION = 'x',
		};

		DataHolder();
		DataHolder(const DataHolder& data);
		DataHolder(DataHolder&& data);
		~DataHolder();

		DataHolder& operator=(const DataHolder& data);
		DataHolder& operator=(DataHolder&& data);

		bool operator==(const DataHolder& data) const;
		bool operator!=(const DataHolder& data) const;

		bool is_empty() const;

		const Type& get_type() const;
		Units& get_own_units();
		Units& get_enemy_units();
		int get_expression_value();

		template<class T>
		const T& get(const Type& type) const
		{
			switch (type)
			{
				case Type::OWN_UNITS:
					return (*_own_units);
					break;
				case Type::ENEMY_UNITS:
					return (*_enemy_units);
					break;
				case Type::EXPRESSION:
					return _value;
					break;
			}
		}

		bool set_own_units(Units& units);
		bool set_enemy_units(Units& units);
		bool set_expression_value(const int& value);

		template<class T>
		void set(const Type& type, T& data)
		{
			// TODO: skip if data was set before.
			switch (type)
			{
				case Type::OWN_UNITS:
					_own_units = &data;
					break;
				case Type::ENEMY_UNITS:
					_enemy_units = &data;
					break;
				case Type::EXPRESSION:
					_value = data;
					break;
			}
		}

		void clear();

	private:
		Type _type;
		Units* _own_units;
		Units* _enemy_units;
		int _value; // expression result or amount of units.
};


// __ABSTRACT_DATA_H__
#endif
