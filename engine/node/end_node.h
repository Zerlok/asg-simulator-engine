#ifndef __END_NODE_H__
#define __END_NODE_H__


#include "core/types.hpp"
#include "abstract.hpp"


class EndNode : public AbstractNode
{
	public:
		static EndNode* cast(AbstractNode* node);

		EndNode(const int in_ports = 1);
		EndNode(const Arguments& args);
		EndNode(const EndNode& node);
		EndNode(EndNode&& node);
		~EndNode();

		const DataHolder& execute() override;
		Arguments get_arguments() const override;

		DataHolder& get_data();
		const DataHolder& get_data() const;
};


// __END_NODE_H__
#endif
