#include <sstream>
#include <stdexcept>
#include "common/utils.h"
#include "node_reader.h"


static const std::string ERR_CANNOT_OPEN_FILE = "Can't open the file: ";


NodeReader::NodeReader(const std::string& filename, NodeFactory& node_factory)
	: _infile(filename),
	  _node_factory(node_factory),
	  _nodes()
{
	if (!_infile.is_open())
	{
		std::stringstream ss;
		ss << ERR_CANNOT_OPEN_FILE << filename;
		throw std::invalid_argument(ss.str());
	}
}


NodeReader::~NodeReader()
{
	_infile.close();
}


void NodeReader::read()
{
	_read_node_table();
	_read_node_connections();

	std::cout << "Read nodes:" << std::endl;
	for (AbstractNode* node : _nodes)
		std::cout << "   * " << node->get_type()
				  << " linked to " << node->get_connected_outputs().size() << " nodes"
				  << std::endl;
}


const Nodes& NodeReader::get_nodes() const
{
	return _nodes;
}


void NodeReader::_read_node_table()
{
	std::string line;
	Arguments values;
	AbstractNode::Type node_type;
	while (std::getline(_infile, line))
	{
		if (line.empty()
				|| (line.front() == nodeformat::comment))
			continue;

		else if (line.compare(nodeformat::end_of_data) == 0)
			break;

		values = stringutils::split(line, nodeformat::separator, true);
		node_type = AbstractNode::make_type(std::stoi(values.front()));
		values.erase(values.begin());
		_nodes.push_back(_node_factory.create(node_type, values));
	}
}


void NodeReader::_read_node_connections()
{
	std::string line;
	while (std::getline(_infile, line))
	{
		if (line.empty()
				|| (line.front() == nodeformat::comment))
			continue;

		else if (line.compare(nodeformat::end_of_data) == 0)
			break;

		std::vector<std::string> values = stringutils::split(line, nodeformat::separator);
		int output_node_port = 0;
		size_t output_node_num = 0;

		// Find out node.
		for (size_t i = 0; i < values.size(); ++i)
		{
			if (values[i].front() == nodeformat::output_node)
			{
				output_node_num = i;
				output_node_port = -std::stoi(values[i]);
				break;
			}
		}

		// Make connections to ins nodes from out.
		AbstractNode* output_node = _nodes[output_node_num];
		for (size_t i = 0; i < values.size(); ++i)
		{
			if (i == output_node_num)
				continue;

			if (!(values[i].empty())
					&& isdigit(values[i].front()))
				output_node->link(output_node_port, std::stoi(values[i]), _nodes[i]);
		}
	}
}
