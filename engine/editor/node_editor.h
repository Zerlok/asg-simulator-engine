#ifndef __NODE_EDITOR_H__
#define __NODE_EDITOR_H__


#include "core/types.h"


class NodeEditor
{
	public:
		NodeEditor();
		~NodeEditor();

		void run();
		void save(const std::string& filename);

	private:
		Nodes _nodes;
};


// __NODE_EDITOR_H__
#endif
