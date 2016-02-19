#ifndef __UNIT_READER_H__
#define __UNIT_READER_H__


#include <string>
#include <fstream>
#include "core/factories.h"


namespace unitformat
{
	static const char comment = '#';
	static const char separator = '|';
	static const std::string end_of_data = "[EOD]";
}


class UnitReader
{
	public:
		UnitReader(const std::string& filename, UnitFactory& unit_factory);
		~UnitReader();

		void read();
		const Units& get_units();

	private:
		UnitReader();
		UnitReader(const UnitReader& reader);

		std::ifstream _infile;
		UnitFactory& _unit_factory;
		Units _units;
};


// __UNIT_READER_H__
#endif
