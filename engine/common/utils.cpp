#include <sstream>

#include "utils.h"


size_t pos(const std::string& data, const char s)
{
	size_t p = data.find(s);
	return ((p != std::string::npos)
			? p
			: data.length());
}


Strings stringutils::split(
		const std::string& data,
		const char separator,
		const bool skip_empty_values)
{
	std::vector<std::string> strings;

	if (data.empty())
		return std::move(strings);

	std::string str = data + separator;
	const size_t max_len = str.length();
	std::string value;

	size_t separator_pos;
	while (!str.empty())
	{
		separator_pos = pos(str, separator);
		value = str.substr(0, separator_pos);

		if (!value.empty()
				|| !skip_empty_values)
			strings.push_back(value);

		str = str.substr(separator_pos+1, max_len);
	}

	return std::move(strings);
}


std::string stringutils::join(
		const Strings& data,
		const char separator,
		const bool skip_empty_values)
{
	if (data.empty())
		return std::move(std::string());

	std::stringstream ss;
	size_t i;
	for (i = 0; i < data.size()-1; ++i)
		if (!skip_empty_values
				|| !data[i].empty())
			ss << data[i] << separator;

	ss << data[i];
	return ss.str();
}


Strings stringutils::to_strings(const int& argc, char *argv[])
{
	Strings args;
	for (int i = 0; i < argc; ++i)
		args.push_back(argv[i]);

	return std::move(args);
}


bool stringutils::startswith(const std::string& main, const std::string& substr)
{
	return (main.substr(0, substr.size()) == substr);
}


bool operator==(const std::string& s1, const std::string& s2)
{
	return (s1.compare(s2) == 0);
}


bool operator!=(const std::string& s1, const std::string& s2)
{
	return (s1.compare(s2) != 0);
}
/**
  TODO: figure out what's wrong
*/
//template<>
std::ostream& operator<<(std::ostream& out, const Strings& vec)
{
	const size_t len = vec.size();
	out << '[' << len << "] {";

	if (len > 0)
	{
		size_t i;

		out << '\'';
		for (i = 0; i < len-1; ++i)
			out << vec[i] << "', '";

		out << vec[i] << '\'';
	}

	return out << '}';
}
