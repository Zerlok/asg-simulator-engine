#include <sstream>

#include "end_node.h"


EndNode* EndNode::cast(AbstractNode* node)
{
	if ((node != nullptr)
			&& (node->get_type() == AbstractNode::Type::end))
		return ((EndNode*)node);

	return nullptr;
}


EndNode::EndNode(const int in_ports_num)
	: AbstractNode(Type::end, in_ports_num, 0)
{
}


EndNode::EndNode(const Arguments& args)
	: AbstractNode(Type::end, std::stoi(args[0]), 0)
{
}


EndNode::EndNode(const EndNode& node)
	: AbstractNode(node)
{
}


EndNode::EndNode(EndNode&& node)
	: AbstractNode(std::move(node))
{
}


EndNode::~EndNode()
{
}


const NodeData& EndNode::execute()
{
//	for (const NodeData& data : _inputs)
//		_result_data.

	return _result_data;
}


Arguments EndNode::get_arguments() const
{
	return std::move(Arguments());
}


NodeData& EndNode::get_data()
{
	return _result_data;
}


const NodeData& EndNode::get_data() const
{
	return _result_data;
}
