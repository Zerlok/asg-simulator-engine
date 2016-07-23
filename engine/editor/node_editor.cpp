#include <iomanip>
#include <sstream>
#include <algorithm>
#include <iterator>

#include "node/root_node.h"
#include "common/utils.h"
#include "node_editor.h"


static const std::string ERR_CANNOT_OPEN_FILE = "Can't open the file: ";

const char NodeEditor::COMMENT = '#';
const char NodeEditor::SEPARATOR = ' ';
const char NodeEditor::PORT_SEPARATOR = ':';
const std::string NodeEditor::INPUT_SYMBOL = "> ";
const std::string NodeEditor::CMD_EXIT = "exit";
const std::string NodeEditor::CMD_HELP = "help";
const std::string NodeEditor::CMD_NEW = "new";
const std::string NodeEditor::CMD_DEL = "del";
const std::string NodeEditor::CMD_TABLE = "table";
const std::string NodeEditor::CMD_LINK = "link";
const std::string NodeEditor::CMD_UNLINK = "unlink";
const std::string NodeEditor::CMD_SAVE = "save";
const std::string NodeEditor::CMD_LOAD = "load";


NodeEditor::NodeEditor(std::istream& in, std::ostream& out)
	: _input(in),
	  _output(out),
	  _sim(),
	  _factory(_sim.get_node_factory()),
	  _reader(_factory),
	  _writer(),
	  _nodes({ new RootNode() })
{
}


NodeEditor::~NodeEditor()
{
	_clear_nodes();
}


void NodeEditor::run()
{
	_output << INPUT_SYMBOL;
	_output.flush();

	std::string line;
	while (std::getline(_input, line))
	{
		if (line.empty()
				|| (line.front() == COMMENT))
		{
			_output << INPUT_SYMBOL;
			_output.flush();
			continue;
		}

		else if (line == CMD_EXIT)
			break;

		Arguments args = stringutils::split(line, SEPARATOR);
		std::string cmd = args.front();
		args.erase(args.begin());

		if (cmd == CMD_TABLE)
			show_nodes(args);

		else if (cmd == CMD_NEW)
			create_node(args);

		else if (cmd == CMD_DEL)
			delete_node(args);

		else if (cmd == CMD_LINK)
			link_nodes(args);

		else if (cmd == CMD_UNLINK)
			unlink_nodes(args);

		else if (cmd == CMD_SAVE)
			save(args);

		else if (cmd == CMD_LOAD)
			load(args);

		else if (cmd == CMD_HELP)
			help(args);

		else
			_output << "Unknown command: " << cmd << std::endl;

		_output << INPUT_SYMBOL;
		_output.flush();
	}
}


void NodeEditor::show_nodes(const Arguments& args) const
{
	if (!args.empty())
	{
		const int i = std::stoi(args[0]);
		const size_t idx = ((i >= 0)
							? (i)
							: (i + _nodes.size()));

		_output << idx << ' ';
		_show_node(_nodes[idx]);
	}
	else
	{
		const size_t len = _nodes.size();
		_output << "Total: " << len << std::endl;

		for (size_t i = 0; i < len; ++i)
		{
			_output << i << ' ';
			_show_node(_nodes[i]);
		}
	}
}


void NodeEditor::create_node(const Arguments& args)
{
	if (args.empty())
		return;

	const std::string node_type = args[0];
	Arguments creator_args;
	std::copy(args.begin()+1, args.end(), std::back_inserter(creator_args));

	try
	{
		_nodes.push_back(_factory.create(node_type, creator_args));
		_output << "Node (" << _nodes.size()-1 << ") was created." << std::endl;
	}
	catch (std::exception& e)
	{
		_output << node_type << " node creation failed!" << std::endl;
	}

}


void NodeEditor::delete_node(const Arguments& args)
{
	const size_t len = _nodes.size();
	const int i = std::stoi(args[0]) % len;
	const size_t idx = ((i >= 0)
						? (i)
						: (i + len));

	_clear_node_links(_nodes[idx]);
	delete _nodes[idx];

	_nodes.erase(_nodes.begin() + idx);
	_output << "Node (" << idx << ") was deleted." << std::endl;
}


void NodeEditor::link_nodes(const Arguments& args)
{
	if (args.size() < 2)
		return;

	const Arguments arg0 = stringutils::split(args[0], PORT_SEPARATOR);
	const Arguments arg1 = stringutils::split(args[1], PORT_SEPARATOR);

	if ((arg0.size() < 2)
			|| (arg1.size() < 2))
		return;

	const size_t node_from_id = std::stoi(arg0[0]);
	const size_t out_port_num = std::stoi(arg0[1]);
	const size_t node_to_id = std::stoi(arg1[0]);
	const size_t in_port_num = std::stoi(arg1[1]);

	_nodes[node_from_id]->link(out_port_num, in_port_num, *(_nodes[node_to_id]));
}


void NodeEditor::unlink_nodes(const Arguments& args)
{
	if (args.size() < 2)
		return;

	const Arguments arg0 = stringutils::split(args[0], PORT_SEPARATOR);
	const Arguments arg1 = stringutils::split(args[1], PORT_SEPARATOR);

	if ((arg0.size() < 2)
			|| (arg1.size() < 2))
		return;

	const size_t node_from_id = std::stoi(arg0[0]);
	const size_t out_port_num = std::stoi(arg0[1]);
	const size_t node_to_id = std::stoi(arg1[0]);
	const size_t in_port_num = std::stoi(arg1[1]);

	_nodes[node_from_id]->unlink(out_port_num, in_port_num, *(_nodes[node_to_id]));
}


void NodeEditor::save(const Arguments& args) const
{
	if (args.empty())
		return;

	std::ofstream outfile(args[0]);
	_writer.write(outfile, _nodes);
}


void NodeEditor::load(const Arguments& args)
{
	if (args.empty())
		return;

	std::ifstream infile(args[0]);
	_clear_nodes();
	_nodes = _reader.read(infile);
}


void NodeEditor::help(const Arguments& args)
{
	static const size_t offset = 28;
	if (args.empty())
	{
		_output << "Available commands:" << std::endl << std::left
				<< std::setw(offset) << CMD_HELP << "- shows list of all available commands in editor." << std::endl
				<< std::setw(offset) << CMD_HELP + " nodes" << "- shows list of all available nodes." << std::endl
				<< std::setw(offset) << CMD_EXIT << "- exits the editor immediately." << std::endl
				<< std::setw(offset) << CMD_NEW + " [node_type]" << "- create the node with given type." << std::endl
				<< std::setw(offset) << CMD_DEL + " [ID]" << "- delete node and release all connections." << std::endl
				<< std::setw(offset) << CMD_TABLE << "- shows table of current created nodes (ID, name, links)." << std::endl
				<< std::setw(offset) << CMD_LINK + " [ID1:p1] [ID2:p2]" << "- create link from output of node with ID1 port1 to input of node with ID2 port2." << std::endl
				<< std::setw(offset) << CMD_UNLINK + " [ID1:p1] [ID2:p2]" << "- remove link." << std::endl
				<< std::setw(offset) << CMD_SAVE + " [filename]" << "- save nodes into file." << std::endl
				<< std::setw(offset) << CMD_LOAD + " [filename]" << "- load nodes from file." << std::endl;
	}
	else if (args[0] == "nodes")
	{
		_output << "Available nodes' types:" << std::endl;
		for (const NodeFactory::Keys::value_type& node_name : _factory.get_registered())
			_output << "  " << node_name << std::endl;
	}
}


void NodeEditor::_clear_nodes()
{
	for (const AbstractNode* node : _nodes)
		delete node;

	_nodes.clear();
}


void NodeEditor::_clear_node_links(AbstractNode* node)
{
	AbstractNode::OutPorts output_ports;
	for (AbstractNode* n : _nodes)
	{
		if (n != node)
		{
			output_ports = n->get_output_ports();
			for (size_t out_port_num = 0;
				 out_port_num < output_ports.size();
				 ++out_port_num)
				for (AbstractNode::PortPair& port_pair : output_ports[out_port_num])
					if (port_pair.first == node)
						n->unlink(out_port_num, port_pair.second, *(port_pair.first));
		}
	}
}


size_t NodeEditor::_get_node_index(AbstractNode* node) const
{
	for (size_t i = 0; i < _nodes.size(); ++i)
		if (_nodes[i] == node)
			return i;

	return 0;
}


void NodeEditor::_show_node(const AbstractNode* node) const
{
	_output << node->get_type()
			<< " args: " << node->get_arguments()
			<< " ports: ";

	const AbstractNode::OutPorts ports = node->get_output_ports();

	if (ports.empty())
	{
		_output << "none" << std::endl;
		return;
	}

	_output << " ports: ";
	AbstractNode::PortPairs port;
	for (size_t i = 0; i < ports.size(); ++i)
	{
		port = ports[i];
		if (port.empty())
			continue;

		_output << i << " -> {";
		for (size_t j = 0; j < port.size()-1; ++j)
			_output << _get_node_index(port[j].first) << ':' << port[j].second << ' ';

		_output << _get_node_index(port.back().first) << ':' << port.back().second << "}; ";
	}

	_output << std::endl;
}
