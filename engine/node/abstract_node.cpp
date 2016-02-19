#include <stdexcept>
#include <string>
#include "abstract_node.h"


static const std::string ERR_INVALID_PORTS_NUM = "Invalid number of ports: must be positive or zero value!";


AbstractNode::Type AbstractNode::make_type(const int t)
{
	Type type;

	switch (t)
	{
		case (int(AbstractNode::Type::root)):
			type = AbstractNode::Type::root;
			break;

		case (int(AbstractNode::Type::cmd_fire)):
			type = AbstractNode::Type::cmd_fire;
			break;

		case (int(AbstractNode::Type::cmd_hold)):
			type = AbstractNode::Type::cmd_hold;
			break;

		case (int(AbstractNode::Type::cmd_move)):
			type = AbstractNode::Type::cmd_move;
			break;

		case (int(AbstractNode::Type::units_select)):
			type = AbstractNode::Type::units_select;
			break;

		case (int(AbstractNode::Type::condition)):
			type = AbstractNode::Type::condition;
			break;

		case (int(AbstractNode::Type::end)):
			type = AbstractNode::Type::end;
			break;

		default:
			break;
	}

	return type;
}


AbstractNode::AbstractNode(const Type& type, const int in_ports_num, const int out_ports_num)
	: _type(type),
	  _inputs(in_ports_num),
	  _outputs(out_ports_num)
{
	if ((in_ports_num < 0)
			|| (out_ports_num < 0))
		throw std::invalid_argument(ERR_INVALID_PORTS_NUM);
}


AbstractNode::AbstractNode(const AbstractNode& node)
	: _type(node._type),
	  _inputs(node._inputs),
	  _outputs(node._outputs)
{
}


AbstractNode::AbstractNode(AbstractNode&& node)
	: _type(std::move(node._type)),
	  _inputs(std::move(node._inputs)),
	  _outputs(std::move(node._outputs))
{
}


AbstractNode::~AbstractNode()
{
}


void AbstractNode::link(const int out_port_num, const int in_port_num, AbstractNode* node)
{
	if ((node == nullptr)
			|| !_is_valid_out_port_num(out_port_num)
			|| !(node->_is_valid_in_port_num(in_port_num))
			|| is_linked(out_port_num, in_port_num, node))
		return;

	_outputs[out_port_num].push_back({node, in_port_num});
}


bool AbstractNode::is_linked(const int out_port_num, const int in_port_num, const AbstractNode* node) const
{
	if (node == nullptr)
		return false;

	for (const PortPair& port_pair : _outputs[out_port_num])
		if ((port_pair.first == node)
				&& (port_pair.second == in_port_num))
			return true;

	return false;
}


const AbstractNode::Type& AbstractNode::get_type() const
{
	return _type;
}


const AbstractNode::InDatas& AbstractNode::get_input_datas() const
{
	return _inputs;
}


const AbstractNode::OutPorts& AbstractNode::get_output_ports() const
{
	return _outputs;
}


Nodes AbstractNode::get_connected_outputs()
{
	Nodes outputs;

	for (PortPairList& port_pairs_lst : _outputs)
		for (PortPair& port_pair : port_pairs_lst)
			outputs.push_back(port_pair.first);

	return std::move(outputs);
}


const Nodes AbstractNode::get_connected_outputs() const
{
	Nodes outputs;

	for (const PortPairList& port_pairs_lst : _outputs)
		for (const PortPair& port_pair : port_pairs_lst)
			outputs.push_back(port_pair.first);

	return std::move(outputs);
}


bool AbstractNode::operator==(const AbstractNode* node) const
{
	return (size_t(this) == size_t(node));
}


bool AbstractNode::operator!=(const AbstractNode* node) const
{
	return (!(this->operator==(node)));
}


bool AbstractNode::operator<(const AbstractNode* node) const
{
	return (size_t(this) < size_t(node));
}


void AbstractNode::_forward_result_to_outputs()
{
	for (PortPairList& port_pair_lst : _outputs)
		for (PortPair& port_pair : port_pair_lst)
			port_pair.first->_inputs[port_pair.second] = _result_data;
//			port_pair.first->_receive_data(port_pair.second, _result_data);

	_result_data.clear();
}


//void AbstractNode::_receive_data(const int in_port_num, const Battlefield& data)
//{
//	_inputs[in_port_num] = data;
//}


bool AbstractNode::_is_valid_in_port_num(const int in_port_num) const
{
	return ((in_port_num >= 0)
			&& (in_port_num < int(_inputs.size())));
}


bool AbstractNode::_is_valid_out_port_num(const int out_port_num) const
{
	return ((out_port_num >= 0)
			&& (out_port_num < int(_outputs.size())));
}


std::ostream& operator<<(std::ostream& out, const AbstractNode::Type& type)
{
	switch (type)
	{
		case (AbstractNode::Type::root):
			out << "[ROOT]";
			break;

		case (AbstractNode::Type::cmd_fire):
			out << "[CMD_FIRE]";
			break;

		case (AbstractNode::Type::cmd_hold):
			out << "[CMD_HOLD]";
			break;

		case (AbstractNode::Type::cmd_move):
			out << "[CMD_MOVE]";
			break;

		case (AbstractNode::Type::units_select):
			out << "[UNITS_SELECT]";
			break;

		case (AbstractNode::Type::condition):
			out << "[CONDITION]";
			break;

		case (AbstractNode::Type::end):
			out << "[END]";
			break;

		default:
			out << "[UNKNOWN]";
			break;
	}

	return out;
}


std::istream& operator>>(std::istream& in, AbstractNode::Type& type)
{
	int t;
	in >> t;
	type = AbstractNode::make_type(t);

	return in;
}
