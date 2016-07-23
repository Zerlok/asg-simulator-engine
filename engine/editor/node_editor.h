#ifndef __NODE_EDITOR_H__
#define __NODE_EDITOR_H__


#include <iostream>
#include <fstream>
#include <string>

#include "core/types.h"
#include "node_reader_writer.h"
#include "simulator/node_simulator.h"


class NodeEditor
{
	public:
		NodeEditor(std::istream& in = std::cin, std::ostream& out = std::cout);
		NodeEditor(const std::string& filename);
		~NodeEditor();

		void run();

		void show_nodes(const Arguments& args) const;
		void create_node(const Arguments& args);
		void delete_node(const Arguments& args);
		void link_nodes(const Arguments& args);
		void unlink_nodes(const Arguments& args);
		void save(const Arguments& args) const;
		void load(const Arguments& args);
		void help(const Arguments& args);

	private:
		static const char COMMENT;
		static const char SEPARATOR;
		static const char PORT_SEPARATOR;
		static const std::string INPUT_SYMBOL;
		static const std::string CMD_EXIT;
		static const std::string CMD_HELP;
		static const std::string CMD_NEW;
		static const std::string CMD_DEL;
		static const std::string CMD_TABLE;
		static const std::string CMD_LINK;
		static const std::string CMD_UNLINK;
		static const std::string CMD_SAVE;
		static const std::string CMD_LOAD;

		std::istream& _input;
		std::ostream& _output;

		const NodeSimulator _sim;
		const NodeFactory& _factory;
		NodeReader _reader;
		NodeWriter _writer;
		Nodes _nodes;

		void _clear_nodes();
		void _clear_node_links(AbstractNode* node);
		size_t _get_node_index(AbstractNode* node) const;
		void _show_node(const AbstractNode* node) const;
};


// __NODE_EDITOR_H__
#endif
