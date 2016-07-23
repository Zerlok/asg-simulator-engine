#ifdef __GTEST_DEBUG_ASG__

#include <gtest/gtest.h>
#include <algorithm>

#include "common/point.h"
#include "common/range.h"
#include "common/utils.h"

#include "node/node_utils.h"
#include "editor/node_reader_writer.h"
#include "core/factories.h"

#include "node/abstract_node.h"
#include "node/cmd_fire_node.h"
#include "node/cmd_hold_node.h"
#include "node/cmd_move_node.h"
#include "node/units_select_node.h"
#include "node/root_node.h"

#include "output/json_tools.hpp"

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

template <typename NodeType>
void reg_type (AbstractNode::Type type, NodeFactory &factory)
{
	std::ostringstream oss;
	oss << type;
	factory.registerate<NodeType>( oss.str() );
}

TEST(Node, SortByLevels) {
    NodeFactory factory;
    NodeReader reader(factory);

	reg_type<RootNode> (AbstractNode::Type::root, factory);
	reg_type<CmdFireNode> (AbstractNode::Type::cmd_fire, factory);
	reg_type<CmdHoldNode> (AbstractNode::Type::cmd_hold, factory);
	reg_type<CmdMoveNode> (AbstractNode::Type::cmd_move, factory);
	reg_type<UnitsSelectNode> (AbstractNode::Type::units_select, factory);

	std::ostringstream oss;
	oss << AbstractNode::Type::root;
	factory.registerate<RootNode>( oss.str() );

	Nodes initial_nodes = reader.read("strategies/defence_strategy.txt");
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

struct ComplexTestObject
{
	int a = 23;
	float b = 7.2;
	char c = 'n';
	bool d = true;
	std::string name = "object";
	std::vector <ComplexTestObject> vec;
};

template<>
struct JsonWriter::ObjectPrinter <ComplexTestObject>
{
	// A flag to detect the extension
	static constexpr bool is_printable = true;

	/*
	 * Generates printing instructions: an array of print_X_to_string
	 * results (TODO: only X = pair?).
	 * `multiline` properties intended to be set to true *must* be set to
	 * `multiline` to enable single-line printing. Otherwise, single-line
	 * output will be JSON-correct, but not visually structured (and not
	 * single-line).
	*/
	static std::vector <std::string> generate_object_inners (const ComplexTestObject &what, bool multiline)
	{
		return {
			print_pair_to_string ("a", what.a, false),
			print_pair_to_string ("b", what.b, false),
			print_pair_to_string ("c", what.c, false),
			print_pair_to_string ("d", what.d, false),
			print_pair_to_string ("name", what.name, false),
			print_pair_to_string ("vec", what.vec, multiline, multiline)
		};
	}
};

struct SimpleTestObject
{
	int a;
	int b;
};

template<>
struct JsonWriter::ObjectPrinter <SimpleTestObject>
{
	static constexpr bool is_printable = true;
	static std::vector <std::string> generate_object_inners
			(const SimpleTestObject &what, bool multiline)
	{
		return {
			print_pair_to_string ("a", what.a, false),
			print_pair_to_string ("b", what.b, false),
		};
	}
};

struct RegularTestObject
{
	int num = 1;
	std::vector<int> single_line { 3, 2, 1 };
	std::vector<int> multiline { 4, 5, 6 };
	std::vector<SimpleTestObject> single_complex { {3, 2}, {2, -1} };
	std::vector<SimpleTestObject> multi_single { {30, 20}, {20, -10} };
	std::vector<SimpleTestObject> multi_complex { {300, 200}, {200, -100} };
};

template<>
struct JsonWriter::ObjectPrinter <RegularTestObject>
{
	static constexpr bool is_printable = true;
	static std::vector <std::string> generate_object_inners
			(const RegularTestObject &what, bool multiline)
	{
		return {
			print_pair_to_string ("num", what.num, false),
			print_pair_to_string ("single_line", what.single_line, false, false),
			print_pair_to_string ("multiline", what.multiline, false, false),
			// `true` serves for test purposes only and should not affect anything
			print_pair_to_string ("single_complex", what.single_complex, false, true),
			print_pair_to_string ("multi_single", what.multi_single, multiline, false),
			print_pair_to_string ("multi_complex", what.multi_complex, multiline, multiline),
		};
	}
};

TEST(Output, JsonWriter)
{
	std::ostringstream oss;
	JsonWriter writer (oss);

	writer.print_object (234);
	ASSERT_EQ ("234", oss.str());
	oss.str ("");

	writer.print_object (3.4);
	ASSERT_EQ ("3.4", oss.str());
	oss.str ("");

	/* Fun fact: scientific notation is implementation-defined
	 * TODO: regex-check it
	 * Regex to do it: ([\+\-]?([0-9])*\.?([0-9])+|[\+\-]?([0-9])+\.?([0-9])*)[eE][\+\-]?([0-9])+
	writer.print (3e27);
	ASSERT_TRUE ("3e27" == oss.str() || "3E27" == oss.str());
	oss.str ("");
	*/

	writer.print_object ('c');
	ASSERT_EQ ("\"c\"", oss.str());
	oss.str ("");

	writer.print_object (true);
	ASSERT_EQ ("true", oss.str());
	oss.str ("");

	writer.print_object (false);
	ASSERT_EQ ("false", oss.str());
	oss.str ("");

	// Note: this is not a std::string test, but a const char[] one
	writer.print_object ("STRing! \t \\ \" / \b \f \n \r");
	ASSERT_EQ ("\"STRing! \\t \\\\ \\\" \\/ \\b \\f \\n \\r\"", oss.str());
	oss.str ("");

	std::string str {"STRing! \t \\ \" / \b \f \n \r"};
	writer.print_object (str);
	ASSERT_EQ ("\"STRing! \\t \\\\ \\\" \\/ \\b \\f \\n \\r\"", oss.str());
	oss.str ("");

	std::pair <std::string, float> pair = {"label", 42.2};
	writer.print_pair (pair);
	ASSERT_EQ ("\"label\" : 42.2", oss.str());
	oss.str ("");

	SimpleTestObject simple {35, 46};
	writer.print_object (simple, false);
	ASSERT_EQ ("{\"a\" : 35, \"b\" : 46}", oss.str());
	oss.str ("");

	std::vector <std::string> simple_lines {
		"{",
		"    \"a\" : 35,",
		"    \"b\" : 46",
		"}"
	};

	writer.print_object (simple, true);
	std::istringstream iss (oss.str());
	for (std::string &str : simple_lines) {
		std::string line;
		std::getline (iss, line);
		ASSERT_EQ (str, line);
	}
	oss.str ("");

	std::vector <std::string> regular_lines {
		"{",
		"    \"num\" : 1,",
		"    \"single_line\" : [3, 2, 1],",
		"    \"multiline\" : [4, 5, 6],",
		"    \"single_complex\" : [{\"a\" : 3, \"b\" : 2}, {\"a\" : 2, \"b\" : -1}],",
		"    \"multi_single\" : [",
		"        {\"a\" : 30, \"b\" : 20},",
		"        {\"a\" : 20, \"b\" : -10}",
		"    ],",
		"    \"multi_complex\" : [",
		"        {",
		"            \"a\" : 300,",
		"            \"b\" : 200",
		"        },",
		"        {",
		"            \"a\" : 200,",
		"            \"b\" : -100",
		"        }",
		"    ]",
		"}"
	};

	writer.print_object (RegularTestObject());
	iss.str( oss.str() );
	iss.clear(); // Clear EOF flag
	for (std::string &str : regular_lines) {
		std::string line;
		std::getline (iss, line);
		ASSERT_EQ (str, line);
	}
	oss.str ("");

	std::vector <std::string> complex_lines {
		"{",
		"    \"a\" : 23,",
		"    \"b\" : 7.2,",
		"    \"c\" : \"n\",",
		"    \"d\" : true,",
		"    \"name\" : \"object\",",
		"    \"vec\" : [",
		"        {",
		"            \"a\" : 23,",
		"            \"b\" : 7.2,",
		"            \"c\" : \"n\",",
		"            \"d\" : true,",
		"            \"name\" : \"inner1\",",
		"            \"vec\" : [",
		"                {",
		"                    \"a\" : 23,",
		"                    \"b\" : 7.2,",
		"                    \"c\" : \"n\",",
		"                    \"d\" : true,",
		"                    \"name\" : \"inner1_inner\",",
		"                    \"vec\" : []",
		"                }",
		"            ]",
		"        },",
		"        {",
		"            \"a\" : 23,",
		"            \"b\" : 7.2,",
		"            \"c\" : \"n\",",
		"            \"d\" : true,",
		"            \"name\" : \"inner2\",",
		"            \"vec\" : []",
		"        }",
		"    ]",
		"}"
	};

	ComplexTestObject complex;
	complex.vec.push_back(ComplexTestObject());
	complex.vec[0].name = "inner1";
	complex.vec.push_back(ComplexTestObject());
	complex.vec[1].name = "inner2";
	complex.vec[0].vec.push_back(ComplexTestObject());
	complex.vec[0].vec[0].name = "inner1_inner";
	writer.print_object (complex, true);

	iss.str( oss.str() );
	iss.clear(); // Clear EOF flag
	for (std::string &str : complex_lines) {
		std::string line;
		std::getline (iss, line);
		ASSERT_EQ (str, line);
	}
	oss.str ("");

	std::string complex_single_line
		= std::string("{")
			+ "\"a\" : 23, " + "\"b\" : 7.2, " + "\"c\" : \"n\", " + "\"d\" : true, " +
			"\"name\" : \"object\", " +
			"\"vec\" : [" +
				"{" + "\"a\" : 23, " + "\"b\" : 7.2, " + "\"c\" : \"n\", " + "\"d\" : true, " +
				"\"name\" : \"inner1\", " +
				"\"vec\" : [" +
					"{" + "\"a\" : 23, " + "\"b\" : 7.2, " + "\"c\" : \"n\", " + "\"d\" : true, " +
					"\"name\" : \"inner1_inner\", " +
					"\"vec\" : []" +
					"}" + "]" +
				"}, " +
				"{" + "\"a\" : 23, " + "\"b\" : 7.2, " + "\"c\" : \"n\", " + "\"d\" : true, " +
					"\"name\" : \"inner2\", " +
					"\"vec\" : []" +
				"}" +
			"]" +
		"}";

	writer.print_object (complex, false);
	ASSERT_EQ (complex_single_line, oss.str());
	oss.str ("");
}

int main(int argc, char *argv[])
{
	::testing::InitGoogleTest(&argc, argv);
	return RUN_ALL_TESTS();
}


#endif
