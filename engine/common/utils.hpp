#ifndef __ASG_UTILS_H__
#define __ASG_UTILS_H__


#include <iostream>
#include <string>
#include <vector>


using Strings = std::vector<std::string>;


namespace stringutils
{
	Strings split(const std::string& data, const char separator, const bool skip_empty_values=false);
	std::string join(const Strings& data, const char separator, const bool skip_empty_values=false);
	Strings to_strings(const int& argc, char *argv[]);

	bool startswith(const std::string& main, const std::string& substr);
}


bool operator==(const std::string& s1, const std::string& s2);
bool operator!=(const std::string& s1, const std::string& s2);


template<class T>
std::ostream& operator<<(std::ostream& out, const std::vector<T>& vec)
{
	const size_t len = vec.size();
	out << '[' << len << "] {";

	if (len > 0)
	{
		size_t i;
		for (i = 0; i < len-1; ++i)
			out << vec[i] << ", ";

		out << vec[i];
	}

	return out << '}';
}


// __ASG_UTILS_H__
#endif
