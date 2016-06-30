#ifndef __STRINGUTILS_H__
#define __STRINGUTILS_H__


#include <iostream>
#include <string>
#include <vector>
#include "core/types.h"


namespace stringutils
{
	std::vector<std::string> split(const std::string& data, const char separator, const bool skip_empty_values=false);
}


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


// __STRINGUTILS_H__
#endif
