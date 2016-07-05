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
	for (const AbstractNode* node : _nodes)
		delete node;
}


void NodeEditor::run()
{
	std::string line;
	while (std::getline(_input, line))
	{
		if (line.empty()
				|| (line.front() == COMMENT))
			continue;

		else if (line == CMD_EXIT)
			break;

		Arguments args = stringutils::split(line, SEPARATOR);
		args.erase(args.begin());

		if (line == CMD_TABLE)
			show_all_nodes(args);

		else if (stringutils::startswith(line, CMD_NEW))
			create_node(args);

		else if (stringutils::startswith(line, CMD_DEL))
			delete_node(args);

		else if (stringutils::startswith(line, CMD_LINK))
			link_nodes(args);

		else if (stringutils::startswith(line, CMD_UNLINK))
			unlink_nodes(args);

		else if (stringutils::startswith(line, CMD_SAVE))
			save(args);

		else if (stringutils::startswith(line, CMD_SAVE))
			load(args);

		else if (stringutils::startswith(line, CMD_HELP))
			help(args);
	}
}


void NodeEditor::show_all_nodes(const Arguments& args) const
{
	if (!args.empty())
	{
		const int i = std::stoi(args[0]);
		const size_t idx = ((i >= 0)
							? (i)
							: (i + _nodes.size()));

		_output << idx << ' ';
		_show_node(_nodes[idx]);
		return;
	}

	const size_t len = _nodes.size();
	_output << "Total: " << len << std::endl;

	for (size_t i = 0; i < len; ++i)
	{
		_output << i << ' ';
		_show_node(_nodes[i]);
	}
}


void NodeEditor::create_node(const Arguments& args)
{
	const std::string node_name = args[0];
	Arguments creator_args;
	std::copy(args.begin()+1, args.end(), std::back_inserter(creator_args));
	_nodes.push_back(_factory.create(node_name, creator_args));
}


void NodeEditor::delete_node(const Arguments& args)
{
	const int i = std::stoi(args[0]);
	const size_t idx = ((i >= 0)
						? (i)
						: (i + _nodes.size()));

	delete _nodes[idx];
	_nodes.erase(_nodes.begin() + idx);
}


void NodeEditor::link_nodes(const Arguments& args)
{
	const Arguments arg0 = stringutils::split(args[0], PORT_SEPARATOR);
	const Arguments arg1 = stringutils::split(args[1], PORT_SEPARATOR);

	const size_t node_from_id = std::stoi(arg0[0]);
	const size_t out_port_num = std::stoi(arg0[1]);
	const size_t node_to_id = std::stoi(arg1[0]);
	const size_t in_port_num = std::stoi(arg1[1]);

	_nodes[node_from_id]->link(out_port_num, in_port_num, *(_nodes[node_to_id]));
}


void NodeEditor::unlink_nodes(const Arguments& args)
{
	const Arguments arg0 = stringutils::split(args[0], PORT_SEPARATOR);
	const Arguments arg1 = stringutils::split(args[1], PORT_SEPARATOR);

	const size_t node_from_id = std::stoi(arg0[0]);
	const size_t out_port_num = std::stoi(arg0[1]);
	const size_t node_to_id = std::stoi(arg1[0]);
	const size_t in_port_num = std::stoi(arg1[1]);

	_nodes[node_from_id]->unlink(out_port_num, in_port_num, *(_nodes[node_to_id]));
}


void NodeEditor::save(const Arguments& args) const
{
	std::ofstream outfile(args[0]);
	_writer.write(outfile, _nodes);
}


void NodeEditor::load(const Arguments& args)
{
	std::ifstream infile(args[0]);
	_nodes = _reader.read(infile);
}


void NodeEditor::help(const Arguments& args)
{
	if (args.empty())
	{
		_output << "\
help - shows list of all available commands in editor.\
help nodes - shows list of all available nodes.\
new [node_name] - create node.\
del [ID] - delete node and release all connections.\
table - shows table of current created nodes (ID, name, links).\
link [ID1:port1] [ID2:port2] - create link from output of node with ID1 port1 to input of node with ID2 port2.\
unlink [ID1:port1] [ID2:port2] - remove link.\
save [filename] - save nodes into file.\
load [filename] - load nodes from file.";
	}
	else if (args[0] == "nodes")
	{
		_output << "List of available nodes:" << std::endl;
		for (const NodeFactory::Keys::value_type& node_name : _factory.get_registered())
			_output << "  - " << node_name << std::endl;
	}
}


void NodeEditor::_show_node(const AbstractNode* node) const
{
	// #TODO: add connections view.
	_output << '<' << node->get_type() << "> "
			<< node->get_arguments()
			<< std::endl;
}
