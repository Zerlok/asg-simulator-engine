#ifndef TEST_NODE_H
#define TEST_NODE_H


#include "core/types.hpp"
#include "abstract.hpp"


/*
 * This class is used in level sort tests (allows to build more complex node networks then default node classes).
*/
class TestNode : public AbstractNode
{
    public:
        TestNode(const size_t &in_ports_num = 1, const size_t &out_ports_num = 1);
        ~TestNode();

        const DataHolder& execute() override;
        Arguments get_arguments() const override;
};


#endif // TEST_NODE_H

