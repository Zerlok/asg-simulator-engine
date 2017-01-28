#include <stdexcept>
#include <algorithm>

#include "common/utils.hpp"
#include "node_reader_writer.h"


static const std::string ERR_CANNOT_OPEN_FILE = "Can't open the file: ";


NodeReader::NodeReader(const NodeFactory& node_factory)
	: _node_factory(node_factory)
{
}


NodeReader::~NodeReader()
{
}


Nodes NodeReader::read(const std::string& filename) const
{
	std::ifstream infile(filename);

	if (!infile.is_open())
	{
		std::stringstream ss;
		ss << ERR_CANNOT_OPEN_FILE << filename;
		throw std::invalid_argument(ss.str());
	}

	return read(infile);
}


Nodes NodeReader::read(std::ifstream& infile) const
{
	Nodes nodes;
	_read_node_table(infile, nodes);
	_read_node_connections(infile, nodes);

	return std::move(nodes);
}


void NodeReader::_read_node_table(std::ifstream& infile, Nodes& nodes) const
{
	std::string line;
	Arguments values;
	NodeFactory::Key node_type;
	while (std::getline(infile, line))
	{
		if (line.empty()
				|| (line.front() == nodeformat::comment))
			continue;

		else if (line == nodeformat::end_of_data)
			break;

		values = stringutils::split(line, nodeformat::separator, true);
		node_type = values.front();
		values.erase(values.begin());
		nodes.push_back(_node_factory.create(node_type, values));
	}
}


void NodeReader::_read_node_connections(std::ifstream& infile, Nodes& nodes) const
{
	std::string line;
	while (std::getline(infile, line))
	{
		if (line.empty()
				|| (line.front() == nodeformat::comment))
			continue;

		else if (line == nodeformat::end_of_data)
			break;

		std::vector<std::string> values = stringutils::split(line, nodeformat::separator);
		int output_node_port = 0;
		size_t output_node_num = 0;

		// Find out node.
		for (size_t i = 0; i < values.size(); ++i)
		{
			if (values[i].front() == nodeformat::output_node_symbol)
			{
				output_node_num = i;
				output_node_port = -std::stoi(values[i]);
				break;
			}
		}

		// Make connections to ins nodes from out.
		for (size_t i = 0; i < values.size(); ++i)
		{
			if (i == output_node_num)
				continue;

			if (!(values[i].empty())
					&& std::isdigit(values[i].front()))
				nodes[output_node_num]->link(output_node_port, std::stoi(values[i]), *(nodes[i]));
		}
	}
}


NodeWriter::NodeWriter()
{
}


NodeWriter::~NodeWriter()
{
}


void NodeWriter::write(const std::string& filename, const Nodes& nodes) const
{
	std::ofstream outfile(filename);

	if (!outfile.is_open())
	{
		std::stringstream ss;
		ss << ERR_CANNOT_OPEN_FILE << filename;
		throw std::invalid_argument(ss.str());
	}

	return write(outfile, nodes);
}



void NodeWriter::write(std::ofstream& outfile, const Nodes& nodes) const
{
	_write_node_table(outfile, nodes);
	_write_node_connections(outfile, nodes);
}


void NodeWriter::_write_node_table(std::ofstream& outfile, const Nodes& nodes) const
{
	Arguments node_args;
	for (const AbstractNode* node : nodes)
	{
		node_args = node->get_arguments();
		outfile << node->get_type();

		if (!node_args.empty())
			outfile << nodeformat::separator
					<< stringutils::join(node_args, nodeformat::separator);

		outfile << std::endl;
	}

	outfile << nodeformat::end_of_data << std::endl;
}


void NodeWriter::_write_node_connections(std::ofstream& outfile, const Nodes& nodes) const
{
	Nodes::iterator it;

	// For each node in given nodes.
	for (size_t node_id = 0;
		 node_id < nodes.size();
		 ++node_id)
	{
		// For each output ports.
		const AbstractNode::OutPorts ports = nodes[node_id]->get_output_ports();
		for (size_t out_port_num = 0;
			 out_port_num < ports.size();
			 ++out_port_num)
		{
			// For each nodes' id.
			for (size_t i = 0; i < nodes.size(); ++i)
			{
				// Check for connections other nodes.
				if (i != node_id)
				{
					// Find input_port_num and write it, if i node is connected to current.
					for (const AbstractNode::PortPair& pair : ports[out_port_num])
						if (pair.first == nodes[i])
							outfile << pair.second;
				}
				// Write output_port_num.
				else
					outfile << nodeformat::output_node_symbol
							<< out_port_num;

				outfile << nodeformat::separator;
			}

			outfile.seekp(-1, std::ios::cur);
			outfile << std::endl;
		}
	}

	outfile << nodeformat::end_of_data << std::endl;
}
