#include <sstream>
#include "unit/abstract_unit.h"
#include "cmd_fire_node.h"


const Point CmdFireNode::battlefield_size = Point(5, 0, 0);


CmdFireNode::CmdFireNode(const Point& pos)
	: AbstractNode(Type::cmd_fire, 1, 1),
	  _target_pos(battlefield_size - pos)
{
}


CmdFireNode::CmdFireNode(const Arguments& args)
	: AbstractNode(Type::cmd_fire, 1, 1),
	  _target_pos(battlefield_size)
{
	Point pos;
	std::stringstream ss(args[0]);
	ss >> pos;
	_target_pos -= pos;
}


CmdFireNode::CmdFireNode(const CmdFireNode& node)
	: AbstractNode(node),
	  _target_pos(node._target_pos)
{
}


CmdFireNode::CmdFireNode(CmdFireNode&& node)
	: AbstractNode(std::move(node)),
	  _target_pos(std::move(node._target_pos))
{
}


CmdFireNode::~CmdFireNode()
{
}


const Battlefield& CmdFireNode::execute()
{
	_result_data = std::move(_inputs[0]);

	// Get total damage from shooting side.
	unsigned long long int sum_damage = 0;
	for (AbstractUnit* unit : _result_data[BattleSide::self])
		sum_damage += unit->fire();

	// Get targets by position.
	// TODO: Create units position filter.
	Units targets;
	for (AbstractUnit* unit : _result_data[BattleSide::enemy])
		if (unit->get_position() == _target_pos)
			targets.push_back(unit);

	if (targets.size() == 0)
	{
		_forward_result_to_outputs();
		return _result_data;
	}

	// Count damage for each target.
	size_t dmg = sum_damage / targets.size();

	if (dmg > 1)
		for (AbstractUnit* unit : targets)
			unit->receive_damage(dmg);

	/*
	 * If each target receives less than 1 damage, than make 1 point damage to
	 * less amount of ships.
	 */
	// TODO: Randomize ships.
	else
		for (size_t i = 0; i < dmg; ++i)
			targets[i]->receive_damage(1);

	_forward_result_to_outputs();
	return _result_data;
}
