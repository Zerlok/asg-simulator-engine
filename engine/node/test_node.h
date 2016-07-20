#ifndef TEST_NODE_H
#define TEST_NODE_H


#include "core/types.h"
#include "abstract_node.h"


class TestNode : public AbstractNode
{
    public:
        TestNode(const size_t &in_ports_num = 1, const size_t &out_ports_num = 1);
        ~TestNode();

        const NodeData& execute() override;
        Arguments get_arguments() const override;
};


#endif // TEST_NODE_H
