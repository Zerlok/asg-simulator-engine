#ifndef __ABSTRACT_NODE_H__
#define __ABSTRACT_NODE_H__


#include <vector>
#include <list>
#include "core/coretypes.h"


class AbstractNode
{
	public:
		// Types.
		using InDatas = std::vector<Battlefield>;
		using PortPair = std::pair<AbstractNode*, int>;
		using PortPairList = std::list<PortPair>;
		using OutPorts = std::vector<PortPairList>;

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
		AbstractNode(const Type& type, const int in_ports_num, const int out_ports_num);
		AbstractNode(const AbstractNode& node);
		AbstractNode(AbstractNode&& node);
		virtual ~AbstractNode();

		// Virtual methods.
		virtual const Battlefield& execute() = 0;

		// Methods.
		void link(const int out_port_num, const int in_port_num, AbstractNode* node);

		// Getters.
		bool is_linked(const int out_port_num, const int in_port_num, const AbstractNode* node) const;
		const Type& get_type() const;
		const InDatas& get_input_datas() const;
		const OutPorts& get_output_ports() const;

		Nodes get_connected_outputs();
		const Nodes get_connected_outputs() const;

		// Operators.
		bool operator==(const AbstractNode* node) const;
		bool operator!=(const AbstractNode* node) const;
		bool operator<(const AbstractNode* node) const;

	protected:
		// Fileds.
		const Type _type;
		InDatas _inputs;
		OutPorts _outputs;
		Battlefield _result_data;

		// Methods.
		void _forward_result_to_outputs();
		virtual void _receive_data(const int in_port_num, const Battlefield& data);

	private:
		// Methods.
		bool _is_valid_in_port_num(const int in_port_num) const;
		bool _is_valid_out_port_num(const int out_port_num) const;
};


std::ostream& operator<<(std::ostream& out, const AbstractNode::Type& type);
std::istream& operator>>(std::istream& in, AbstractNode::Type& type);


// __ABSTRACT_NODE_H__
#endif
