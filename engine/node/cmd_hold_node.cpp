#include <sstream>

#include "unit/abstract_unit.h"
#include "cmd_hold_node.h"


CmdHoldNode::CmdHoldNode()
	: AbstractNode(Type::cmd_hold, 1, 0)
{
}


CmdHoldNode::CmdHoldNode(const Arguments&)
	: AbstractNode(Type::cmd_hold, 1, 0)
{
}


CmdHoldNode::CmdHoldNode(const CmdHoldNode& node)
	: AbstractNode(node)
{
}


CmdHoldNode::CmdHoldNode(CmdHoldNode&& node)
	: AbstractNode(std::move(node))
{
}


CmdHoldNode::~CmdHoldNode()
{
}


const DataHolder& CmdHoldNode::execute()
{
	_result_data = _receive_data_from_input(0);

	for (AbstractUnit* unit : _result_data[BattleSide::self])
		unit->hold();

	return _result_data;
}


Arguments CmdHoldNode::get_arguments() const
{
	return std::move(Arguments());
}

