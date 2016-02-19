#ifndef __ROOT_NODE_H__
#define __ROOT_NODE_H__


#include "core/coretypes.h"
#include "abstract_node.h"


class RootNode : public AbstractNode
{
	public:
		static RootNode* cast(AbstractNode* node);

		RootNode(const Battlefield& data = Battlefield());
		RootNode(const Arguments& args);
		RootNode(const RootNode& node);
		RootNode(RootNode&& node);
		~RootNode();

		const Battlefield& execute();

		void set_data(const Battlefield& data);
};


// __ROOT_NODE_H__
#endif
