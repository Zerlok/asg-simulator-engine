#ifndef __CMD_HOLD_NODE_H__
#define __CMD_HOLD_NODE_H__


#include "core/types.hpp"
#include "abstract.hpp"


class CmdHoldNode : public AbstractNode
{
	public:
		CmdHoldNode();
		CmdHoldNode(const Arguments&);
		CmdHoldNode(const CmdHoldNode& node);
		CmdHoldNode(CmdHoldNode&& node);
		~CmdHoldNode();

		const DataHolder& execute() override;
		Arguments get_arguments() const override;
};


// __CMD_HOLD_NODE_H__
#endif
