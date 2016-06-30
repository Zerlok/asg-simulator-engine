#ifndef __ENGINE_FACTORIES_H__
#define __ENGINE_FACTORIES_H__


#include "types.h"
#include "common/factory.h"
#include "node/abstract_node.h"


using UnitFactory = Factory<std::string, AbstractUnit>;


namespace std
{
	template <>
	class hash<AbstractNode::Type>
	{
		public:
			size_t operator()(const AbstractNode::Type& type) const
			{
				return hash<int>()(int(type));
			}
	};
}
using NodeFactory = Factory<AbstractNode::Type, AbstractNode>;


// __ENGINE_FACTORIES_H__
#endif
