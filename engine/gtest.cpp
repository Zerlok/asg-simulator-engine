#ifdef __GTEST_DEBUG_ASG__

#include <gtest/gtest.h>
#include <algorithm>

#include "common/point.h"
#include "common/range.h"
#include "common/utils.h"

#include "node/node_utils.h"
#include "editor/node_reader_writer.h"
#include "core/factories.h"

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

TEST(Node, SortByLevels) {
    NodeFactory factory;
    NodeReader reader(factory);

    Nodes initial_nodes = reader.read("tests/strategies/defence_strategy.txt");
    Nodes sorted_nodes = nodeutils::sort_by_levels(initial_nodes);
    std::vector<size_t> sorted_order;
    for(size_t i = 0; i < initial_nodes.size(); ++i)
    {
        auto match = find(sorted_nodes.begin(), sorted_nodes.end(), initial_nodes[i]);
        EXPECT_FALSE(match == sorted_nodes.end());

        size_t index = match - sorted_nodes.begin();
        sorted_order.push_back(index);
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


TEST(Unit, AbstractUnit)
{

}


TEST(Unit, NormalUnit)
{

}


TEST(Unit, UnitReader)
{

}
*/


int main(int argc, char *argv[])
{
	::testing::InitGoogleTest(&argc, argv);
	return RUN_ALL_TESTS();
}


#endif
