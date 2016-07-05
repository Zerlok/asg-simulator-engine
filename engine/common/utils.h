#ifndef __ASG_UTILS_H__
#define __ASG_UTILS_H__


#include <iostream>
#include <string>
#include <vector>


namespace stringutils
{
	std::vector<std::string> split(const std::string& data, const char separator, const bool skip_empty_values=false);
	std::string join(const std::vector<std::string>& data, const char separator, const bool skip_empty_values=false);

	bool startswith(const std::string& main, const std::string& substr);
}


bool operator==(const std::string& s1, const std::string& s2);
bool operator!=(const std::string& s1, const std::string& s2);


template<class T>
std::ostream& operator<<(std::ostream& out, const std::vector<T>& vec)
{
	const size_t len = vec.size();
	out << '[' << len << "] {";

	for (size_t i = 0; i < len; ++i)
		out << vec[i] << ", ";

	if (len > 0)
		out << "\b\b";

	return out << '}';
}


// __ASG_UTILS_H__
#endif
