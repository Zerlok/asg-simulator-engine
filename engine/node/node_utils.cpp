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

bool operator<(const std::pair<size_t, AbstractNode*>& left, const std::pair<size_t, AbstractNode*>& right)
{
    return left.first < right.first;
}

// #TODO: rewrite level sort.
Nodes nodeutils::sort_by_levels(Nodes& nodes)
{
    // init levels with 0's
    std::vector<std::pair<size_t, AbstractNode*>> levels;
    for(auto node : nodes)
    {
        levels.push_back({0, node});
    }

    // init queue with root
    AbstractNode* root = find_root(nodes);
    Nodes nodes_queue({root});

    // calculate levels
    while(nodes_queue.size() != 0)
    {
        size_t parent_index = find(nodes.begin(), nodes.end(), nodes_queue[0]) - nodes.begin();
        for(auto child_node : nodes_queue[0]->get_connected_outputs())
        {
            size_t child_index = find(nodes.begin(), nodes.end(), child_node) - nodes.begin();
            if(levels[child_index].first < levels[parent_index].first + 1)
            {
                levels[child_index].first = levels[parent_index].first + 1;
                nodes_queue.push_back(child_node);
            }
        }
        nodes_queue.erase(nodes_queue.begin());
    }

    // sort by levels
    std::sort(levels.begin(), levels.end());

    // return sorted Nodes
    Nodes result;
    for(auto level_pair : levels) {
        result.push_back(level_pair.second);
    }
    return std::move(result);
}
