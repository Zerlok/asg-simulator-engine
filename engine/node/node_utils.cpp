#include <algorithm>
#include <iterator>
#include <set>
#include "node_utils.h"


RootNode* nodeutils::find_root(const Nodes& nodes)
{
	RootNode* root = nullptr;

	for (AbstractNode* node : nodes)
	{
		root = RootNode::cast(node);
		if (root != nullptr)
			return root;
	}

	return root;
}


// #TODO: rewrite level sort.
Nodes nodeutils::sort_by_levels(Nodes& nodes)
{
	using NodeSet = std::set<AbstractNode*>;
	NodeSet queue;
	queue.insert(find_root(nodes));

	for (AbstractNode* node : queue)
		for (AbstractNode* out : node->get_connected_outputs())
			queue.insert(out);

	Nodes sorted;
	std::copy(queue.begin(), queue.end(), std::back_inserter(sorted));

	return std::move(sorted);
}
