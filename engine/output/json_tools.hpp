#ifndef JSON_TOOLS
#define JSON_TOOLS

#include <functional>
#include <type_traits>
#include <ostream>
#include <utility>
#include <vector>

class JsonWriter
{
public:
	JsonWriter (std::ostream &dest) : dest (dest) {}

	template <template<class...> class Container, class Content>
	void print (const Container<Content> &container, bool multiline = true)
	{
		print_array (container, multiline);
	}

	template <typename T>
	void print (const std::pair<std::string, T> &pair)
	{
		print_pair (pair.first, pair.second);
	}

	template <typename T, typename... Args>
	void print (const T &what)
	{
		ValuePrinter<T, Args...>::print_value(dest, what);
	}

	void print (const std::vector<std::function<void()>> &print_instructions,
				bool multiline = true)
	{
		print_object(print_instructions, multiline);
	}

	// Костыль? std::string == std::basic_string <char>
	void print (const std::string &what)
	{
		ValuePrinter<std::string>::print_value(dest, what);
	}

private:
	const size_t INDENT = 4;
	std::ostream &dest;

	// Current JsonWriter state
	size_t indent_level = 0;

	void inc_indent() { indent_level++; }
	void dec_indent() { if (indent_level > 0) indent_level--; }

	void new_line()
	{
		std::string spacer (INDENT * indent_level, ' ');
		dest << std::endl << spacer;
	}

	/*
	 * `print_instructions` is supposed to be a list of
	 * `print_something` functions
	*/
	void print_object (const std::vector<std::function<void()>> &print_instructions,
					   bool multiline = true)
	{
		dest << '{';

		if (multiline) {
			inc_indent();
			new_line();
		}

		for (auto it = print_instructions.begin(); it != print_instructions.end();) {
			it->operator()();
			if ( ++it != print_instructions.end() ) {
				dest << ',';
				if (multiline)
					new_line();
				else
					dest << ' ';
			}
		}

		if(multiline) {
			dec_indent();
			new_line();
		}

		dest << '}';
		new_line();
	}

	template <typename T>
	void print_pair (const std::string &key, const T &value)
	{
		dest << '\"' << key << "\" : ";
		print (value);
	}

	template <template<class...> class Container, class Content>
	void print_array (const Container<Content> &container, bool multiline = true)
	{
		dest << '[';

		if (multiline) {
			inc_indent();
			new_line();
		}

		for (auto it = container.begin(); it != container.end();) {
			ValuePrinter <Content>::print_value (dest, *it);
			if ( ++it != container.end() ) {
				dest << ',';
				if (multiline)
					new_line();
				else
					dest << ' ';
			}
		}

		if (multiline) {
			dec_indent();
			new_line();
		}

		dest << ']';
		new_line();
	}

	template <typename T, typename Dummy = T>
	struct ValuePrinter
	{
		static void print_value (std::ostream &dest, const T &)
		{
			static_assert (sizeof(T) < 0,
						   "JsonWriter::print_value(): unsupported object, define a specialization");
		}
	};

	template <typename T>
	struct ValuePrinter
	<
		T,
		typename std::enable_if <std::is_arithmetic <T>::value
								 && !std::is_same <T, char>::value
								 && !std::is_same <T, signed char>::value
								 && !std::is_same <T, unsigned char>::value
								 && !std::is_same <T, bool>::value, T>::type
	>
	{
		static void print_value (std::ostream &dest, const T &what) {
			dest << what;
		}
	};

	template <typename T>
	static void print_char (std::ostream &dest, const T what)
	{
		switch (what) {
		case '\t':
			dest << "\\t";
			break;
		case '\"':
			dest << "\\\"";
			break;
		case '\\':
			dest << "\\\\";
			break;
		case '/':
			dest << "\\/";
			break;
		case '\b':
			dest << "\\b";
			break;
		case '\f':
			dest << "\\f";
			break;
		case '\n':
			dest << "\\n";
			break;
		case '\r':
			dest << "\\r";
			break;
		default:
			dest << what;
		}
	}

	template <typename T>
	struct ValuePrinter
	<
		T,
		typename std::enable_if <std::is_same <T, char>::value
								 || std::is_same <T, signed char>::value
								 || std::is_same <T, unsigned char>::value, T>::type
	>
	{
		static void print_value (std::ostream &dest, const T &what) {
			dest << "\"";
			print_char (dest, what);
			dest << "\"";
		}
	};

	template <typename T>
	struct ValuePrinter
	<
		T,
		typename std::enable_if <std::is_same <T, std::string>::value, T>::type
	>
	{
		static void print_value (std::ostream &dest, const std::string &what)
		{
			dest << "\"";
			for (char c : what)
				print_char (dest, c);
			dest << "\"";
		}
	};

	template <size_t N>
	struct ValuePrinter <char[N]>
	{
		static void print_value (std::ostream &dest, const char what[N])
		{
			std::string theString (what, N-1);
			ValuePrinter<std::string>::print_value(dest, theString);
		}
	};

	template <typename T>
	struct ValuePrinter
	<
		T,
		typename std::enable_if <std::is_same <T, bool>::value, T>::type
	>
	{
		static void print_value (std::ostream &dest, const bool what)
		{
			if (what)
				dest << "true";
			else
				dest << "false";
		}
	};
};

//template <>
//struct JsonWriter::ValuePrinter
//<
//	std::string
//>
//{
//	static void print_value (std::ostream &dest, const std::string &what)
//	{
//		dest << "\"";
//		for (char c : what)
//			print_char (dest, c);
//		dest << "\"";
//	}
//};

#endif // JSON_TOOLS

