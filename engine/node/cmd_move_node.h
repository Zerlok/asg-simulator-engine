#ifndef __CMD_MOVE_NODE_H__
#define __CMD_MOVE_NODE_H__


#include "common/point.hpp"
#include "core/types.hpp"
#include "abstract.hpp"


class CmdMoveNode : public AbstractNode
{
	public:
		CmdMoveNode(const Point& direction = Point::zero);
		CmdMoveNode(const Arguments& args);
		CmdMoveNode(const CmdMoveNode& node);
		CmdMoveNode(CmdMoveNode&& node);
		~CmdMoveNode();

		const DataHolder& execute() override;
		Arguments get_arguments() const override;

	private:
		Point _direction;
};


// __CMD_MOVE_NODE_H__
#endif
