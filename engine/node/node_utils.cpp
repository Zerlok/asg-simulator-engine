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

std::vector<size_t> nodeutils::review_subtree(AbstractNode* root, Nodes& nodes)
{
	static std::vector<size_t> numbers_of_input_ports;
	if(numbers_of_input_ports.size() == 0)
	{
		for(auto node : nodes)
		{
			numbers_of_input_ports.push_back(node->get_input_data().size());
		}
	}

	static std::vector<size_t> numbers_of_visited_input_ports(nodes.size(), 0);
	static std::vector<size_t> levels(nodes.size(), 0);

	size_t root_index = find(nodes.begin(), nodes.end(), root) - nodes.begin();
	Nodes next_roots;

	for(auto outport : root->get_output_ports())
	{
		for(auto portpair : outport)
		{
			size_t index = find(nodes.begin(), nodes.end(), portpair.first) - nodes.begin();
			if(++numbers_of_visited_input_ports[index] == numbers_of_input_ports[index]) // Unaddresssable access here
			{
				if(levels[index] < levels[index] + levels[root_index])
				levels[index] += levels[root_index];
				next_roots.push_back(portpair.first);
			}
		}
	}

	for(auto next_root : next_roots)
	{
		review_subtree(next_root, nodes);
	}

	return levels;
}

bool operator<(const std::pair<size_t, AbstractNode*>& left, const std::pair<size_t, AbstractNode*>& right)
{
	return left.first < right.first;
}

// #TODO: rewrite level sort.
// * This sort works on C*N^2
// * where N is num of nodes,
// * C is max num of input connections for 1 node
Nodes nodeutils::sort_by_levels(Nodes& nodes)
{
	AbstractNode* root = find_root(nodes);
	std::vector<size_t> levels = review_subtree(root, nodes);

	std::vector<std::pair<size_t, AbstractNode*>> pairs_for_sort;
	for(size_t i = 0; i < nodes.size(); ++i)
	{
		pairs_for_sort.push_back(std::make_pair(levels[i], nodes[i]));
	}

	sort(pairs_for_sort.begin(), pairs_for_sort.end());

	Nodes result;
	for(size_t i = 0; i < nodes.size(); ++i)
	{
		result.push_back(pairs_for_sort[i].second);
	}

	return std::move(result);
//	using NodeSet = std::set<AbstractNode*>;
//	NodeSet queue;
//	queue.insert(find_root(nodes));

//	for (AbstractNode* node : queue)
//		for (AbstractNode* out : node->get_connectedget_output_ports()())
//			queue.insert(out);

//	Nodes sorted;
//	std::copy(queue.begin(), queue.end(), std::back_inserter(sorted));

//	return std::move(sorted);
}
