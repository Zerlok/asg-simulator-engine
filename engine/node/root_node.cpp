#include "root_node.h"


RootNode* RootNode::cast(AbstractNode* node)
{
	if ((node != nullptr)
			&& (node->get_type() == AbstractNode::Type::root))
		return ((RootNode*)node);

	return nullptr;
}


RootNode::RootNode(const Battlefield& data)
	: AbstractNode(Type::root, 0, 1)
{
	_result_data = data;
}


RootNode::RootNode(const Arguments& args)
	: AbstractNode(Type::root, 0, 1)
{
}


RootNode::RootNode(const RootNode& node)
	: AbstractNode(node)
{
}


RootNode::RootNode(RootNode&& node)
	: AbstractNode(std::move(node))
{
}


RootNode::~RootNode()
{
}


const Battlefield& RootNode::execute()
{
	_forward_result_to_outputs();
	return _result_data;
}


void RootNode::set_data(const Battlefield& data)
{
	_result_data = data;
}
