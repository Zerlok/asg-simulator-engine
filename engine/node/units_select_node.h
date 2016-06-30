#ifndef __UNITS_SELECT_NODE_H__
#define __UNITS_SELECT_NODE_H__


#include "core/types.h"
#include "abstract_node.h"


class UnitsSelectNode : public AbstractNode
{
	public:
		UnitsSelectNode(const size_t amount = 0,
						const size_t offset = 0,
						const BattleSide& side = BattleSide::self);
		UnitsSelectNode(const Arguments& args);
		UnitsSelectNode(const UnitsSelectNode& node);
		UnitsSelectNode(UnitsSelectNode&& node);
		~UnitsSelectNode();

		const Battlefield& execute();

		// Getters.
		size_t get_amount() const;
		size_t get_offset() const;
		const BattleSide& get_selection_side() const;

	private:
		size_t _amount;
		size_t _offset;
		BattleSide _side;
};


// __UNITS_SELECT_NODE_H__
#endif
