#include "utils.h"


size_t pos(const std::string& data, const char s)
{
	size_t p = data.find(s);
	return ((p != std::string::npos)
			? p
			: data.length());
}


std::vector<std::string> stringutils::split(
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


template<>
std::ostream& operator<<(std::ostream& out, const std::vector<std::string>& vec)
{
	const size_t len = vec.size();
	out << '[' << len << "] {";

	if (len > 0)
		out << '\'';

	for (size_t i = 0; i < len; ++i)
		out << vec[i] << "', '";

	if (len > 0)
		out << "\b\b\b";

	return out << '}';
}
