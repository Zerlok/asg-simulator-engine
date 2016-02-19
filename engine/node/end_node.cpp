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


const Battlefield& EndNode::execute()
{
	for (const Battlefield& data : _inputs)
		_result_data += data;

	return _result_data;
}


Battlefield& EndNode::get_data()
{
	return _result_data;
}


const Battlefield& EndNode::get_data() const
{
	return _result_data;
}
