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

#include "io/json_writer.hpp"
#include "io/json_reader.hpp"

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


struct SimpleTestObject
{
	int a;
	int b;
};

template<>
struct JsonWriter::ObjectPrinter <SimpleTestObject>
{
	static std::vector <std::string> generate_object_inners
			(const SimpleTestObject &what, bool)
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
	/*
	 * Generates printing instructions: an array of print_X_to_string
	 * results (TODO: only X = pair?).
	 * `multiline` properties intended to be set to true *must* be set to
	 * `multiline` to enable single-line printing. Otherwise, single-line
	 * output will be JSON-correct, but not visually structured (and not
	 * single-line).
	*/
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

struct BadTestObject
{
	std::map<int, std::vector<std::vector<int>>> nested {
		{0, {{1, 2, 3}}},
		{1, {{4, 5}, {6}}},
		{2, {{7, 8}, {9, 0}}}
	};
};

template<>
struct JsonWriter::ObjectPrinter <BadTestObject>
{
	static std::vector <std::string> generate_object_inners
			(const BadTestObject &what, bool multiline)
	{
		return {
			print_pair_to_string ("nested", what.nested, multiline, false)
		};
	}
};

class JsonWriterTester
{
public:
	JsonWriterTester () : oss(), writer (oss) {}

	template <typename T>
	void check (const T &to_print, const std::string &expected) {
		writer.print_object (to_print, false);
		ASSERT_EQ (expected, oss.str());
		oss.str ("");
	}

	template <typename T>
	void check (const T &to_print, const std::vector<std::string> &expected) {
		writer.print_object (to_print, true);
		std::istringstream iss (oss.str());
		for (const std::string &str : expected) {
			std::string line;
			std::getline (iss, line);
			ASSERT_EQ (str, line);
		}
		oss.str ("");
	}

private:
	std::ostringstream oss;
	JsonWriter writer;
};

TEST(Json, JsonWriter)
{
	JsonWriterTester tester;

	tester.check (234, "234");

	tester.check (3.4, "3.4");

	/*
	 * Fun fact: scientific notation is implementation-defined
	 * TODO: regex-check it
	 * Regex to do it: ([\+\-]?([0-9])*\.?([0-9])+|[\+\-]?([0-9])+\.?([0-9])*)[eE][\+\-]?([0-9])+
	*/

	tester.check ('c', "\"c\"");

	tester.check (true, "true");

	tester.check (false, "false");

	// Note: this is not an std::string test, but a const char[] one
	tester.check ("STRing! \t \\ \" / \b \f \n \r",
				  "\"STRing! \\t \\\\ \\\" \\/ \\b \\f \\n \\r\"");

	std::string str {"STRing! \t \\ \" / \b \f \n \r"};
	tester.check (str, "\"STRing! \\t \\\\ \\\" \\/ \\b \\f \\n \\r\"");

	SimpleTestObject simple {35, 46};
	tester.check (simple, "{\"a\" : 35, \"b\" : 46}");

	std::vector <std::string> simple_lines {
		"{",
		"    \"a\" : 35,",
		"    \"b\" : 46",
		"}"
	};

	tester.check (simple, simple_lines);

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

	tester.check (RegularTestObject(), regular_lines);
}

#define _JRExtType SimpleTestObject
JsonReaderExtension
	JRExtFields
		JRExtDefineField (a)
		JRExtDefineField (b)
JRExtEnd
#undef _JRExtType

#define _JRExtType RegularTestObject
JsonReaderExtension
	JRExtFields
		JRExtDefineField (num)
		JRExtDefineField (single_line)
		JRExtDefineField (multiline)
		JRExtDefineField (single_complex)
		JRExtDefineField (multi_single)
		JRExtDefineField (multi_complex)
JRExtEnd
#undef _JRExtType

#define _JRExtType BadTestObject
JsonReaderExtension
	JRExtFields
		JRExtDefineField (nested)
JRExtEnd
#undef _JRExtType

struct NoDefaultCtor
{
	NoDefaultCtor () = delete;
	NoDefaultCtor (int a) : a (a) {}

	const int a;
	int b;
};

#define _JRExtType NoDefaultCtor
JsonReaderExtension
	JRExtInitObject
		JRExtGetFieldToVar (int, a)
		JRExtFinishInit (a)
	JRExtFields
		JRExtDefineField (b)
JRExtEnd
#undef _JRExtType

template<>
struct JsonWriter::ObjectPrinter <NoDefaultCtor>
{
	static std::vector <std::string> generate_object_inners
			(const NoDefaultCtor &what, bool)
	{
		return {
			print_pair_to_string ("a", what.a, false),
			print_pair_to_string ("b", what.b, false),
		};
	}
};

class JsonReaderTester
{
public:
	JsonReaderTester () : writer (oss) {}

	template <typename T>
	T translate_object (const T &original)
	{
		writer.print_object (original);
		std::istringstream iss ( oss.str() );
		oss.str ("");
		reader.get_object_string (iss);
		return reader.extract_object <T> ();
	}

private:
	std::ostringstream oss;
	JsonWriter writer;
	JsonReader reader;
};

bool operator== (const SimpleTestObject &lh, const SimpleTestObject &rh)
{
	return (lh.a == rh.a) && (lh.b == rh.b);
}

TEST(Json, JsonReader)
{
	JsonReaderTester tester;

	SimpleTestObject simple_reference {9, 6};
	SimpleTestObject simple_translated = tester.translate_object (simple_reference);

	ASSERT_TRUE (simple_reference.a == simple_translated.a);
	ASSERT_TRUE (simple_reference.b == simple_translated.b);

	RegularTestObject regular_reference;
	RegularTestObject regular_translated = tester.translate_object (regular_reference);

	ASSERT_TRUE (regular_reference.num == regular_translated.num);
	ASSERT_TRUE (regular_reference.single_line == regular_translated.single_line);
	ASSERT_TRUE (regular_reference.multiline == regular_translated.multiline);
	ASSERT_TRUE (regular_reference.single_complex == regular_translated.single_complex);
	ASSERT_TRUE (regular_reference.multi_single == regular_translated.multi_single);
	ASSERT_TRUE (regular_reference.multi_complex == regular_translated.multi_complex);

	BadTestObject bad_reference;
	BadTestObject bad_translated = tester.translate_object (bad_reference);

	ASSERT_TRUE (bad_reference.nested == bad_translated.nested);

	NoDefaultCtor nodef_reference (45);
	nodef_reference.b = 98;
	NoDefaultCtor nodef_translated = tester.translate_object (nodef_reference);

	ASSERT_TRUE (nodef_reference.a == nodef_translated.a);
	ASSERT_TRUE (nodef_reference.b == nodef_translated.b);
}

int main(int argc, char *argv[])
{
	::testing::InitGoogleTest(&argc, argv);
	return RUN_ALL_TESTS();
}


#endif
