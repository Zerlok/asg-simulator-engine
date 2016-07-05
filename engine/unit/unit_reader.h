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
		UnitReader(const UnitFactory& unit_factory);
		~UnitReader();

		Units read(const std::string& filename) const;
		Units read(std::ifstream& infile) const;

	private:
		UnitReader();
		UnitReader(const UnitReader& reader);

		const UnitFactory& _unit_factory;
};


// __UNIT_READER_H__
#endif
