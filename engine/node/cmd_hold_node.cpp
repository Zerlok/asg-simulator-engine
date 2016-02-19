#include "unit/abstract_unit.h"
#include "cmd_hold_node.h"


CmdHoldNode::CmdHoldNode()
	: AbstractNode(Type::cmd_hold, 1, 1)
{
}


CmdHoldNode::CmdHoldNode(const Arguments& args)
	: AbstractNode(Type::cmd_hold, 1, 1)
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


const Battlefield& CmdHoldNode::execute()
{
	_result_data = std::move(_inputs[0]);

	for (AbstractUnit* unit : _result_data[BattleSide::self])
		unit->hold();

	_forward_result_to_outputs();
	return _result_data;
}

