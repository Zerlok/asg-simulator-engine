#ifndef __NODE_READER_H__
#define __NODE_READER_H__


#include <fstream>
#include <sstream>
#include "core/types.h"
#include "core/factories.h"
#include "node/abstract_node.h"


namespace nodeformat
{
	// Basic constants.
	static const char comment = '#';
	static const char separator = '|';
	static const char output_node_symbol = '-';
	static const std::string end_of_data = "[EOD]";
}


class NodeReader
{
	public:
		NodeReader(const NodeFactory& node_factory);
		~NodeReader();

		Nodes read(const std::string& filename) const;
		Nodes read(std::ifstream& infile) const;

	private:
		std::ifstream _infile;
		const NodeFactory& _node_factory;
		Nodes nodes;

		void _read_node_table(std::ifstream& infile, Nodes& nodes) const;
		void _read_node_connections(std::ifstream& infile, Nodes& nodes) const;
};


class NodeWriter
{
	public:
		NodeWriter();
		~NodeWriter();

		void write(const std::string& filename, const Nodes& nodes) const;
		void write(std::ofstream& outfile, const Nodes& nodes) const;

	private:
		void _write_node_table(std::ofstream& outfile, const Nodes& nodes) const;
		void _write_node_connections(std::ofstream& outfile, const Nodes& nodes) const;
};


// __NODE_READER_H__
#endif
