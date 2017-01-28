#include "test_node.h"


TestNode::TestNode(const size_t& in_ports_num, const size_t& out_ports_num)
    : AbstractNode(Type::cmd_move, in_ports_num, out_ports_num)
{
}


TestNode::~TestNode()
{
}


const DataHolder& TestNode::execute()
{
    _push_result_to_outputs();
    return _result_data;
}


Arguments TestNode::get_arguments() const
{
    return std::move(Arguments());
}

