#ifndef __ROOT_NODE_H__
#define __ROOT_NODE_H__


#include "core/types.hpp"
#include "abstract.hpp"


class RootNode : public AbstractNode
{
	public:
		static RootNode* cast(AbstractNode* node);

		RootNode(const DataHolder& data = DataHolder());
		RootNode(const Arguments& args);
		RootNode(const RootNode& node);
		RootNode(RootNode&& node);
		~RootNode();

		const DataHolder& execute() override;
		Arguments get_arguments() const override;

		void set_data(const DataHolder& data);
};


// __ROOT_NODE_H__
#endif
