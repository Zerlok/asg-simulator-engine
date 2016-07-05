#ifndef __CMD_HOLD_NODE_H__
#define __CMD_HOLD_NODE_H__


#include "core/types.h"
#include "abstract_node.h"


class CmdHoldNode : public AbstractNode
{
	public:
		CmdHoldNode();
		CmdHoldNode(const Arguments&);
		CmdHoldNode(const CmdHoldNode& node);
		CmdHoldNode(CmdHoldNode&& node);
		~CmdHoldNode();

		const NodeData& execute() override;
		Arguments get_arguments() const override;
};


// __CMD_HOLD_NODE_H__
#endif
