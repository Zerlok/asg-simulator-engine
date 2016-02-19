#ifndef __STRINGUTILS_H__
#define __STRINGUTILS_H__


#include <string>
#include <vector>
#include "core/coretypes.h"


namespace stringutils
{
	std::vector<std::string> split(const std::string& data, const char separator, const bool skip_empty_values=false);
}


// __STRINGUTILS_H__
#endif
