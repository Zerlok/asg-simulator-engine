#ifndef __ABSTRACT_NODE_H__
#define __ABSTRACT_NODE_H__


#include <vector>
#include "core/data.hpp"
#include "port.h"


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
		using List = std::list<AbstractNode*>;

		// Constructors / Destructor.
		AbstractNode(const std::string& name);
		AbstractNode(const AbstractNode& node);
		AbstractNode(AbstractNode&& node);
		virtual ~AbstractNode();

		const std::string& get_name() const;

		/*
		 * Answers is current node ready for execution. (Is input data enough).
		 * Default: check that all inputs were set.
		 */
		virtual bool is_ready() const;

		/*
		 * Makes transformation with input data and pushes it to next nodes,
		 * which were connected to output ports.
		 */
		void execute()
		{
			if (!is_ready())
				return;

//			for (AbstractPort* input : _inputs)
//				input->save_data();

			_custom_execute();

			for (AbstractPort* output : _outputs)
				output->push();
		}

		/*
		 * Returns node's arguments as vector of strings.
		 */
		virtual Arguments get_arguments() const = 0;

		/*
		 * Connects output port of this node to input port of given node.
		 */
		void link(const size_t& out, const size_t& in, AbstractNode& node);

		/*
		 * Removes connection between output port of this node and input port of
		 * given node.
		 */
		void unlink(const size_t& out, const size_t& in, AbstractNode& node);

		/*
		 * Answers is output port of this node connected to input port of given
		 * node.
		 */
		bool is_linked(const size_t& out, const size_t& in, const AbstractNode& node) const;

		/*
		 * Returns vector of input ports of this node.
		 */
		 const Ports& get_input_ports() const;

		/*
		 * Returns vector of output ports of this node.
		 */
		const Ports& get_output_ports() const;

		/*
		 * Returns vector of nodes, which were connected with this node.
		 */
		const List& get_children_nodes() const;
		const Nodes get_children_nodes() const;

		// Operators.
		bool operator==(const AbstractNode& node) const;
		bool operator!=(const AbstractNode& node) const;
		bool operator<(const AbstractNode& node) const;

	protected:
		// Fileds.
		Ports _inputs;
		Ports _outputs;
		List _children;


		// Methods.
		virtual void _custom_execute() = 0;
};


using Nodes = std::vector<AbstractNode*>;


std::ostream& operator<<(std::ostream& out, AbstractNode& node);


// __ABSTRACT_NODE_H__
#endif
