#ifndef __ENGINE_TYPES_H__
#define __ENGINE_TYPES_H__


#include <string>
#include <vector>
#include "common/factory.hpp"
#include "node/abstract.hpp"


using Arguments = std::vector<std::string>;
using UnitFactory = Factory<std::string, AbstractUnit>;
using NodeFactory = Factory<std::string, AbstractNode>;


// __ENGINE_TYPES_H__
#endif
