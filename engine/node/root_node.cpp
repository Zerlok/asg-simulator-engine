#include "root_node.h"


RootNode* RootNode::cast(AbstractNode* node)
{
	if ((node != nullptr)
			&& (node->get_type() == AbstractNode::Type::root))
		return ((RootNode*)node);

	return nullptr;
}


RootNode::RootNode(const NodeData& data)
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


const NodeData& RootNode::execute()
{
	_push_result_to_outputs();
	return _result_data;
}


Arguments RootNode::get_arguments() const
{
	return std::move(Arguments());
}


void RootNode::set_data(const NodeData& data)
{
	_result_data = data;
}
