#ifndef __ROOT_NODE_H__
#define __ROOT_NODE_H__


#include "core/types.h"
#include "abstract_node.h"


class RootNode : public AbstractNode
{
	public:
		static RootNode* cast(AbstractNode* node);

		RootNode(const NodeData& data = NodeData());
		RootNode(const Arguments& args);
		RootNode(const RootNode& node);
		RootNode(RootNode&& node);
		~RootNode();

		const NodeData& execute() override;
		Arguments get_arguments() const override;

		void set_data(const NodeData& data);
};


// __ROOT_NODE_H__
#endif
