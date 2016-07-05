#include <sstream>

#include "unit/abstract_unit.h"
#include "cmd_move_node.h"


CmdMoveNode::CmdMoveNode(const Point& direction)
	: AbstractNode(Type::cmd_move, 1, 1),
	  _direction(direction)
{
}


CmdMoveNode::CmdMoveNode(const Arguments& args)
	: AbstractNode(Type::cmd_move, 1, 1),
	  _direction()
{
	std::stringstream ss(args[0]);
	ss >> _direction;
}


CmdMoveNode::CmdMoveNode(const CmdMoveNode& node)
	: AbstractNode(node),
	  _direction(node._direction)
{
}


CmdMoveNode::CmdMoveNode(CmdMoveNode&& node)
	: AbstractNode(std::move(node)),
	  _direction(std::move(node._direction))
{
}


CmdMoveNode::~CmdMoveNode()
{
}


const NodeData& CmdMoveNode::execute()
{
	_result_data = _receive_data_from_input(0);

	for (AbstractUnit* unit : _result_data[BattleSide::self])
		unit->move_to(unit->get_position() + _direction);

	_push_result_to_outputs();
	return _result_data;
}


Arguments CmdMoveNode::get_arguments() const
{
	std::stringstream ss;
	ss << _direction;

	return std::move(Arguments({ss.str()}));
}
