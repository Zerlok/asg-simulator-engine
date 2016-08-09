#ifdef __GTEST_DEBUG_ASG__

#include <gtest/gtest.h>
#include <algorithm>

#include "common/point.h"
#include "common/range.h"
#include "common/utils.h"

#include "node/node_utils.h"
#include "node/root_node.h"
#include "node/test_node.h"

#include "unit/abstract_unit.h"
#include "unit/test_unit.h"
#include "unit/battleship_unit.h"

TEST(Common, Point)
{
    Point p1 {1, 2, 3};
    EXPECT_EQ(1, p1.get_x());
    EXPECT_EQ(2, p1.get_y());
    EXPECT_EQ(3, p1.get_z());

    Point p2(p1);
    EXPECT_EQ(p1[0], p2['x']);
    EXPECT_EQ(p1[1], p2['y']);
    EXPECT_EQ(p1[2], p2['z']);
    EXPECT_EQ(p1, p2);

    EXPECT_NE(Point::zero, p1);
    EXPECT_EQ(Point::zero, (p1 - p2));

    Point px2 = p1;
    px2 += p1;
    EXPECT_EQ(2, px2.get_x());
    EXPECT_EQ(4, px2.get_y());
    EXPECT_EQ(6, px2.get_z());

    Point pif1(3, 4, 0);
    Point pif2(3, 4, 5);
    EXPECT_EQ(5, pif1.distance());
    EXPECT_EQ(5, pif2.distance(pif1));
}


TEST(Common, Range)
{
    const int left = 11;
    const int right = 29;
    const int sq_len = (right - left)*(right - left);
    Range<int> rng(left, right);

    for (size_t i = 0; i < sq_len; ++i)
    {
        const int r = rng.get_value();
        ASSERT_LE(left, r);
        ASSERT_GT(right, r);
    }

    EXPECT_EQ(left, rng.get_min_value());
    EXPECT_EQ(right, rng.get_max_value());
}


TEST(Common, StringUtilsSplit)
{
    using Strings = std::vector<std::string>;
    const std::string msg1 = "Hello  This world! ";

    Strings result = stringutils::split(msg1, ' ');
    EXPECT_EQ(5, result.size()) << result;
    EXPECT_EQ("Hello", result[0]);
    EXPECT_EQ("", result[1]);
    EXPECT_EQ("This", result[2]);
    EXPECT_EQ("world!", result[3]);
    EXPECT_EQ("", result[4]);

    result = stringutils::split(msg1, ' ', true);
    EXPECT_EQ(3, result.size()) << result;
    EXPECT_EQ("Hello", result[0]);
    EXPECT_EQ("This", result[1]);
    EXPECT_EQ("world!", result[2]);

    const std::string msg2 = "|Hi||*__*";
    result = stringutils::split(msg2, '|');
    EXPECT_EQ(4, result.size()) << result;
    EXPECT_EQ("", result[0]);
    EXPECT_EQ("Hi", result[1]);
    EXPECT_EQ("", result[2]);
    EXPECT_EQ("*__*", result[3]);

    result = stringutils::split(msg2, '|', true);
    EXPECT_EQ(2, result.size()) << result;
    EXPECT_EQ("Hi", result[0]);
    EXPECT_EQ("*__*", result[1]);

    const std::string empty;
    result = stringutils::split(empty, '!');
    EXPECT_TRUE(result.empty()) << result;
}


TEST(Common, StringUtilsJoin)
{
    std::vector<std::string> data {"Hello", "this", "world!"};
    std::string result = stringutils::join(data, ' ');
    EXPECT_EQ("Hello this world!", result);

    std::vector<std::string> empty;
    result = stringutils::join(empty, '!');
    EXPECT_EQ("", result);
}


TEST(Node, SortByLevels)
{
    Nodes nodes;
    nodes.push_back(new TestNode(2, 0));
    nodes.push_back(new TestNode(2, 1));
    nodes.push_back(new TestNode(3, 0));
    nodes.push_back(new TestNode);
    nodes.push_back(new TestNode(3, 1));
    nodes.push_back(new TestNode(1, 2));
    nodes.push_back(new TestNode);
    nodes.push_back(new TestNode(1, 2));
    nodes.push_back(new TestNode(1, 2));
    nodes.push_back(new RootNode);

/*
    -0|0||0||0|||
    |-0|0||||||
    |||-0|0||||
    |||||-0|0||
    ||||||-0|0|
    [EOD]
*/
    nodes[9]->link(0, 0, *nodes[8]);
    nodes[9]->link(0, 0, *nodes[7]);
    nodes[9]->link(0, 0, *nodes[4]);
    nodes[9]->link(0, 0, *nodes[6]);
    nodes[9]->link(0, 1, *nodes[0]);
    nodes[8]->link(0, 0, *nodes[5]);
    nodes[5]->link(0, 0, *nodes[3]);
    nodes[3]->link(0, 0, *nodes[1]);
    nodes[1]->link(0, 0, *nodes[0]);
    nodes[7]->link(0, 0, *nodes[2]);
    nodes[6]->link(0, 1, *nodes[4]);
    nodes[4]->link(0, 1, *nodes[2]);

    Nodes sorted_nodes = nodeutils::sort_by_levels(nodes);

    EXPECT_TRUE(sorted_nodes[0] == nodes[9]);

    EXPECT_TRUE(
        sorted_nodes[1] == nodes[8] ||
        sorted_nodes[1] == nodes[7] ||
        sorted_nodes[1] == nodes[6]);
    EXPECT_TRUE(
        sorted_nodes[2] == nodes[8] ||
        sorted_nodes[2] == nodes[7] ||
        sorted_nodes[2] == nodes[6]);
    EXPECT_TRUE(
        sorted_nodes[3] == nodes[8] ||
        sorted_nodes[3] == nodes[7] ||
        sorted_nodes[3] == nodes[6]);

    EXPECT_TRUE(
        sorted_nodes[4] == nodes[5] ||
        sorted_nodes[4] == nodes[4]);
    EXPECT_TRUE(
        sorted_nodes[5] == nodes[5] ||
        sorted_nodes[5] == nodes[4]);

    EXPECT_TRUE(
        sorted_nodes[6] == nodes[3] ||
        sorted_nodes[6] == nodes[2]);
    EXPECT_TRUE(
        sorted_nodes[7] == nodes[3] ||
        sorted_nodes[7] == nodes[2]);

    EXPECT_TRUE(sorted_nodes[8] == nodes[1]);

    EXPECT_TRUE(sorted_nodes[9] == nodes[0]);

    for(auto node : nodes)
    {
        delete node;
    }
}


/*
TEST(Node, AbstractNode)
{

}


TEST(Node, RootNode)
{

}


TEST(Node, EndNode)
{

}


TEST(Node, CmdFireNode)
{

}


TEST(Node, CmdHoldNode)
{

}


TEST(Node, CmdMoveNode)
{

}


TEST(Node, UnitsSelectNode)
{

}


TEST(Node, NodeReader)
{

}


TEST(Unit, UnitReader)
{

}
*/


TEST(Unit, AbstractUnit)
{
	/*
	 * TO DO
	 * Calculating methods.
	 * Battle methods.
	 * Getters.
	*/

	TestUnit* unit;

	// Calculating methods.

	unit = new TestUnit;
	delete unit;

	// Status field.

	/*
	 * Moving and attacking actions perform instantly.
	*/

	unit = new TestUnit;
	EXPECT_TRUE(unit->_status == Status::holding);
	unit->fire();
	EXPECT_TRUE(unit->_status == Status::attacking_on_holding) << int(unit->_status);
	unit->fire();
	EXPECT_TRUE(unit->_status == Status::attacking_on_holding);
	unit->move_to(Point(10, 10, 10));
	EXPECT_TRUE(unit->_status == Status::attacking_on_moving);
	unit->hold();
	EXPECT_TRUE(unit->_status == Status::holding);
	unit->hold();
	EXPECT_TRUE(unit->_status == Status::holding);
	unit->move_to(Point(0, 0, 0));
	EXPECT_TRUE(unit->_status == Status::moving);
	delete unit;

	// Battle methods.

	// Getters.
}


TEST(Unit, TestUnit)
{
	/*
	 * All constructors of in game classes (such as Fighter or Battleship)
	 * can be tested on instance of the Test class and there is no need
	 * for individual tests for them (because of the same class structure).
	*/

	Point zero;
	Point point(10, 20);
	TestUnit other(point);
	TestUnit* unit;

	// Constructors.
	unit = new TestUnit;
	EXPECT_TRUE(unit->_pos == zero);
	delete unit;

	unit = new TestUnit(point);
	EXPECT_TRUE(unit->_pos == point);
	delete unit;

	unit = new TestUnit({"Hello", "world!"});
	EXPECT_TRUE(unit->_pos == zero);
	delete unit;

	unit = new TestUnit(other);
	EXPECT_TRUE(unit->_pos == point);
	delete unit;

	unit = new TestUnit;
	EXPECT_TRUE(*unit->_class_stats == TestUnitStats);
	EXPECT_TRUE(unit->_status == Status::holding);
	delete unit;
}


int main(int argc, char *argv[])
{
	::testing::InitGoogleTest(&argc, argv);
	return RUN_ALL_TESTS();
}


#endif
