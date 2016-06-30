#ifndef __RANGE_H__
#define __RANGE_H__


#include <ctime>
#include <cstdlib>


template<typename DataType=int>
class Range
{
	public:
		using value_type = DataType;

		static void randomize(const size_t& seed = 0)
		{
			static bool is_randomized = false;
			if (!is_randomized)
			{
				srand((seed == 0) ? time(NULL) : seed);
				is_randomized = true;
			}
		}

		// Constructors / Destructor.
		Range(const value_type& max_value)
			: _min(0),
			  _max(max_value)
		{
			randomize();
		}
		Range(const value_type& min_value, const value_type& max_value)
			: _min(min_value),
			  _max(max_value)
		{
			randomize();
		}
		Range(const Range<value_type>& range)
			: _min(range._min),
			  _max(range._max) {}
		Range(const Range<value_type>&& range)
			: _min(std::move(range._min)),
			  _max(std::move(range._max)) {}
		~Range() {}

		// Methods.
		value_type get_value() const
		{
			return _min + (rand() % (_max - _min));
		}

		// Getters.
		const value_type& get_min_value() const
		{
			return _min;
		}

		const value_type& get_max_value() const
		{
			return _max;
		}

	private:
		const value_type _min;
		const value_type _max;
};


// __RANGE_H__
#endif
