#include <stdexcept>
#include <string>
#include <algorithm>
#include "abstract.hpp"


AbstractNode::AbstractNode(const std::string& name)
	: _name(name)
{
}


AbstractNode::~AbstractNode()
{
}


const std::string& AbstractNode::get_name() const
{
	return _name;
}


bool AbstractNode::is_ready() const
{
	for (const AbstractPort* input : _inputs)
		if (input->is_empty())
			return false;

	return true;
}


void AbstractNode::link(const size_t& out, const size_t& in, AbstractNode& node)
{
	if (this == &node)
		return;

	_children.push_back(node);
	_outputs[out]->link(node._inputs[in]);
}


void AbstractNode::unlink(const size_t& out, const size_t& in, AbstractNode& node)
{
	_outputs[out]->unlink(node._inputs[in]);
}


bool AbstractNode::is_linked(const size_t& out, const size_t& in, const AbstractNode& node) const
{
	return _outputs[out]->is_linked(node._inputs[in]);
}


const Ports& AbstractNode::get_input_ports() const
{
	return _inputs;
}


const Ports& AbstractNode::get_output_ports() const
{
	return _outputs;
}


const AbstractNode::List& AbstractNode::get_children_nodes() const
{
	return _children;
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
	for (AbstractPort* output : _outputs)
		output->push();
}


void AbstractNode::_put_data_to_input(const size_t& in_port_num, const DataHolder& data)
{
	DataPair& pair = _inputs[in_port_num];
	pair.first = true;
	pair.second = data;
}


DataHolder AbstractNode::_receive_data_from_input(const size_t& in_port_num)
{
	DataPair& pair = _inputs[in_port_num];
	pair.first = false;

	return std::move(pair.second);
}


std::ostream& operator<<(std::ostream& out, AbstractNode& node)
{
	return out << node.get_name();
}
