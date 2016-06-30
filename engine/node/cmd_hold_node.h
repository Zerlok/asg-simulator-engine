#ifndef __CMD_HOLD_NODE_H__
#define __CMD_HOLD_NODE_H__


#include "core/types.h"
#include "abstract_node.h"


class CmdHoldNode : public AbstractNode
{
	public:
		CmdHoldNode();
		CmdHoldNode(const Arguments& args);
		CmdHoldNode(const CmdHoldNode& node);
		CmdHoldNode(CmdHoldNode&& node);
		~CmdHoldNode();

		const Battlefield& execute();
};


// __CMD_HOLD_NODE_H__
#endif
