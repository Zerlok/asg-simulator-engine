#ifndef __NODE_READER_H__
#define __NODE_READER_H__


#include <fstream>
#include "core/coretypes.h"
#include "core/factories.h"
#include "abstract_node.h"


namespace nodeformat
{
	// Basic constants.
	static const char comment = '#';
	static const char separator = '|';
	static const char output_node = '-';
	static const std::string end_of_data = "[EOD]";
}


class NodeReader
{
	public:
		NodeReader(const std::string& filename, NodeFactory& node_factory);
		~NodeReader();

		void read();
		const Nodes& get_nodes() const;

	private:
		NodeReader();
		NodeReader(const NodeReader& reader);

		std::ifstream _infile;
		NodeFactory& _node_factory;
		Nodes _nodes;

		void _read_node_table();
		void _read_node_connections();
};


// __NODE_READER_H__
#endif
