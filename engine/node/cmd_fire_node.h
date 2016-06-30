#ifndef __CMD_FIRE_NODE_H__
#define __CMD_FIRE_NODE_H__


#include "core/types.h"
#include "abstract_node.h"


class CmdFireNode : public AbstractNode
{
	public:
		CmdFireNode(const Point& pos = battlefield_size);
		CmdFireNode(const Arguments& args);
		CmdFireNode(const CmdFireNode& node);
		CmdFireNode(CmdFireNode&& node);
		~CmdFireNode();

		const Battlefield& execute();

	private:
		static const Point battlefield_size;

		Units _targets;
		Point _target_pos; // enemy position (counts from enemy side).
};


// __CMD_FIRE_NODE_H__
#endif
