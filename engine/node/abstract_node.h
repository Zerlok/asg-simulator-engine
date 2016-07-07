#ifndef __ABSTRACT_NODE_H__
#define __ABSTRACT_NODE_H__


#include <vector>
#include "core/types.h"


/*
 * NODE STRUCTURE:
 *   - Node data
 *   - Input ports
 *   - Output ports
 *
 * NODE BEHAVIOUR:
 *   Node takes data from input ports, makes new data with execution process and
 *   passes it to output ports (each port contains custom part of data).
 *
 * NODE DATA:
 *   It contains information about units of each side and expresion Also it should keep info
 *   for conditions (true / false).
 *
 * INPUT PORT:
 *   Each input port receives node data from previous nodes and holds it until
 *   execution process. Only first passed data to input port will be set in node,
 *   all other later data will be rejected.
 *
 * OUTPUT PORT:
 *   Contains information of nodes, where transformed data after execution
 *   process will be sent. Each output port could be connected to many input
 *   ports.
 */
class AbstractNode
{
	public:
		// Types.
		using DataPair = std::pair<bool, NodeData>;			// First: was data set, Second: NodeData itself.
		using InDatas = std::vector<DataPair>;				// Input data for each input port num.
		using PortPair = std::pair<AbstractNode*, size_t>;	// First: connected node pointer, Second: input port num.
		using PortPairs = std::vector<PortPair>;			// All nodes this port is connected to.
		using OutPorts = std::vector<PortPairs>;			// Connections of each output port num.

		enum class Type
		{
			root = 0,
			cmd_fire,
			cmd_hold,
			cmd_move,
			units_select,
			condition,
			end,
		};

		static Type make_type(const int t);

		// Constructors / Destructor.
		AbstractNode(const Type& type, const size_t& in_ports_num, const size_t& out_ports_num);
		AbstractNode(const AbstractNode& node);
		AbstractNode(AbstractNode&& node);
		virtual ~AbstractNode();

		/*
		 * Answers is current node ready for execution. (Is input data enough).
		 * Default: check that all inputs were set.
		 */
		virtual bool is_ready() const;

		/*
		 * Makes transformation with input data and pushes it to next nodes,
		 * which were connected to output ports.
		 */
		virtual const NodeData& execute() = 0;

		/*
		 * Returns node's arguments as vector of strings.
		 */
		virtual Arguments get_arguments() const = 0;

		/*
		 * Connects output port of this node to input port of given node.
		 */
		void link(const size_t& out_port_num, const size_t& in_port_num, AbstractNode& node);

		/*
		 * Removes connection between output port of this node and input port of
		 * given node.
		 */
		void unlink(const size_t& out_port_num, const size_t& in_port_num, AbstractNode& node);

		/*
		 * Answers is output port of this node connected to input port of given
		 * node.
		 */
		bool is_linked(const size_t& out_port_num, const size_t& in_port_num, const AbstractNode& node) const;

		/*
		 * Returns type of this node.
		 */
		const Type& get_type() const;

		/*
		 * Returns vector of input data of this node.
		 */
		const InDatas& get_input_data() const;

		/*
		 * Returns vector of output ports of this node.
		 */
		const OutPorts& get_output_ports() const;

		/*
		 * Returns vector of nodes, which were connected with this node.
		 */
		Nodes get_connected_outputs();
		const Nodes get_connected_outputs() const;

		// Operators.
		bool operator==(const AbstractNode& node) const;
		bool operator!=(const AbstractNode& node) const;
		bool operator<(const AbstractNode& node) const;

	protected:
		// Fileds.
		const Type _type;
		InDatas _inputs;
		OutPorts _outputs;
		NodeData _result_data;

		// Methods.
		void _push_result_to_outputs();
		void _put_data_to_input(const size_t& in_port_num, const NodeData& data);
		NodeData _receive_data_from_input(const size_t& in_port_num);
};


std::ostream& operator<<(std::ostream& out, const AbstractNode::Type& type);
std::istream& operator>>(std::istream& in, AbstractNode::Type& type);


// __ABSTRACT_NODE_H__
#endif
