#include <sstream>
#include "units_select_node.h"


UnitsSelectNode::UnitsSelectNode(const size_t amount, const size_t offset, const BattleSide& side)
	: AbstractNode(Type::units_select, 1, 1),
	  _amount(amount),
	  _offset(offset),
	  _side(side)
{
}


UnitsSelectNode::UnitsSelectNode(const Arguments& args)
	: AbstractNode(Type::units_select, 1, 1),
	  _amount(std::stoi(args[0])),
	  _offset(std::stoi(args[1])),
	  _side()
{
	std::stringstream ss(args[2]);
	ss >> _side;
}


UnitsSelectNode::UnitsSelectNode(const UnitsSelectNode& node)
	: AbstractNode(node),
	  _amount(node._amount),
	  _offset(node._offset),
	  _side(node._side)
{
}


UnitsSelectNode::UnitsSelectNode(UnitsSelectNode&& node)
	: AbstractNode(std::move(node)),
	  _amount(std::move(node._amount)),
	  _offset(std::move(node._offset)),
	  _side(std::move(node._side))
{
}


UnitsSelectNode::~UnitsSelectNode()
{
}



const DataHolder& UnitsSelectNode::execute()
{
	_result_data = _receive_data_from_input(0);

	// Select all units.
	if (_amount == 0)
		return _result_data;

	// Select specified units.
	Units& units = _result_data[_side];
	Units selected_units;
	for (size_t i = _offset;
		 (i < (_offset + _amount)
		  && (i < units.size()));
		 ++i)
		selected_units.push_back(units[i]);

	_result_data[_side] = selected_units;

	_push_result_to_outputs();
	return _result_data;
}


Arguments UnitsSelectNode::get_arguments() const
{
	Arguments args;
	std::stringstream ss;
	ss << _amount;
	args.push_back(ss.str());

	ss.str("");
	ss << _offset;
	args.push_back(ss.str());

	ss.str("");
	ss << _side;
	args.push_back(ss.str());

	return std::move(args);
}


size_t UnitsSelectNode::get_amount() const
{
	return _amount;
}


size_t UnitsSelectNode::get_offset() const
{
	return _offset;
}


const BattleSide& UnitsSelectNode::get_selection_side() const
{
	return _side;
}
