#ifndef __NODE_UTILS_H__
#define __NODE_UTILS_H__


#include "core/types.hpp"
#include "abstract.hpp"
#include "root_node.h"


namespace nodeutils
{
	RootNode* find_root(const Nodes& nodes);
	Nodes sort_by_levels(Nodes& nodes);
}


// __NODE_UTILS_H__
#endif
