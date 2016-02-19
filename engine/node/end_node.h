#ifndef __END_NODE_H__
#define __END_NODE_H__


#include "core/coretypes.h"
#include "abstract_node.h"


class EndNode : public AbstractNode
{
	public:
		static EndNode* cast(AbstractNode* node);

		EndNode(const int in_ports = 1);
		EndNode(const Arguments& args);
		EndNode(const EndNode& node);
		EndNode(EndNode&& node);
		~EndNode();

		const Battlefield& execute();

		Battlefield& get_data();
		const Battlefield& get_data() const;
};


// __END_NODE_H__
#endif
