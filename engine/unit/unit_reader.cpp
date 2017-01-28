#include <sstream>
#include <stdexcept>
#include "common/utils.hpp"
#include "unit_reader.h"


static const std::string ERR_CANNOT_OPEN_FILE = "Can't open the file: ";


UnitReader::UnitReader(const UnitFactory& unit_factory)
	: _unit_factory(unit_factory)
{
}


UnitReader::~UnitReader()
{
}


Units UnitReader::read(const std::string& filename) const
{
	std::ifstream infile(filename);

	if (!infile.is_open())
	{
		std::stringstream ss;
		ss << ERR_CANNOT_OPEN_FILE << filename;
		throw std::invalid_argument(ss.str());
	}

	return read(infile);
}


Units UnitReader::read(std::ifstream& infile) const
{
	Units units;
	std::string line;
	while (std::getline(infile, line))
	{
		if (line.front() == unitformat::comment)
			continue;

		else if (line.compare(unitformat::end_of_data) == 0)
			break;

		Arguments values = stringutils::split(line, unitformat::separator, true);
		const std::string unit_type = values[0];
		const int units_amount = std::stoi(values[1]);

		for (int i = 0; i < units_amount; ++i)
			units.push_back(_unit_factory.create(unit_type));
	}

	return std::move(units);
}
