#include <stdexcept>
#include <string>
#include <algorithm>
#include "abstract_node.h"


AbstractNode::AbstractNode(const Type& type, const size_t& in_ports_num, const size_t& out_ports_num)
	: _type(type),
	  _inputs(in_ports_num),
	  _outputs(out_ports_num)
{
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


bool AbstractNode::is_ready() const
{
	for (const DataPair& pair : _inputs)
		if (!pair.first)
			return false;

	return true;
}


void AbstractNode::link(const size_t& out_port_num, const size_t& in_port_num, AbstractNode& node)
{
	_outputs[out_port_num].push_back({&node, in_port_num});
}


void AbstractNode::unlink(const size_t& out_port_num, const size_t& in_port_num, AbstractNode& node)
{
	PortPairs& port_pairs = _outputs[out_port_num];
	const PortPair pair = {&node, in_port_num};
	const PortPairs::iterator it = std::find(port_pairs.begin(), port_pairs.end(), pair);

	if (it != port_pairs.end())
		port_pairs.erase(it);
}


bool AbstractNode::is_linked(const size_t& out_port_num, const size_t& in_port_num, const AbstractNode& node) const
{
	for (const PortPair& pair : _outputs[out_port_num])
		if ((pair.first == &node)
				&& (pair.second == in_port_num))
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

	for (PortPairs& port_pairs_lst : _outputs)
		for (PortPair& port_pair : port_pairs_lst)
			outputs.push_back(port_pair.first);

	return std::move(outputs);
}


const Nodes AbstractNode::get_connected_outputs() const
{
	Nodes outputs;

	for (const PortPairs& port_pairs_lst : _outputs)
		for (const PortPair& port_pair : port_pairs_lst)
			outputs.push_back(port_pair.first);

	return std::move(outputs);
}


bool AbstractNode::operator==(const AbstractNode& node) const
{
	return (size_t(this) == size_t(&node));
}


bool AbstractNode::operator!=(const AbstractNode& node) const
{
	return (!(this->operator==(node)));
}


bool AbstractNode::operator<(const AbstractNode& node) const
{
	return (size_t(this) < size_t(&node));
}


void AbstractNode::_push_result_to_outputs()
{
	for (PortPairs& port_pair_lst : _outputs)
		for (PortPair& port_pair : port_pair_lst)
			// #TODO: here is copying becomes.
			port_pair.first->_put_data_to_input(port_pair.second, _result_data);

	_result_data.clear();
}


void AbstractNode::_put_data_to_input(const size_t& in_port_num, const NodeData& data)
{
	DataPair& pair = _inputs[in_port_num];
	pair.first = true;
	pair.second = data;
}


NodeData AbstractNode::_receive_data_from_input(const size_t& in_port_num)
{
	DataPair& pair = _inputs[in_port_num];
	pair.first = false;

	return std::move(pair.second);
}


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
		default:
			type = AbstractNode::Type::end;
			break;
	}

	return std::move(type);
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
