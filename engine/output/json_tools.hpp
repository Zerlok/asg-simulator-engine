#ifndef JSON_TOOLS
#define JSON_TOOLS

#include <functional>
#include <type_traits>
#include <ostream>
#include <utility>
#include <vector>

/*
 * TODO: decide if it should be a class or a namespace
 * TODO: decide if methods other than print_object are needed
 * TODO: consider making this class less messy
*/

class JsonWriter
{
public:
	JsonWriter (std::ostream &dest) : dest (dest) {}

	template <typename T>
	void print_pair (const std::string &key, const T &value, bool multiline = false)
	{
		dest << print_pair_to_string (key, value, multiline);
	}

	template <typename T>
	void print_pair (const std::pair<std::string, T> &pair, bool multiline = false)
	{
		print_pair<T> (pair.first, pair.second, multiline);
	}

	template <template<class...> class Container, class Content>
	void print_pair (const std::string &key, const Container <Content> &value,
					 bool multiline = true, bool content_multiline = true)
	{
		dest << print_pair_to_string (key, value, multiline, content_multiline);
	}

	template <template<class...> class Container, class Content>
	void print_pair (const std::pair<std::string, Container <Content>> &pair,
					 bool multiline = true, bool content_multiline = true)
	{
		print_pair<Container<Content>> (pair.first, pair.second, multiline, content_multiline);
	}

	template <template<class...> class Container, class Content>
	void print_array (const Container<Content> &container,
					  bool multiline = true, bool content_multiline = true)
	{
		dest << print_array_to_string (container, multiline, content_multiline);
	}

	template <class Content, int N>
	void print_array (const Content container [N],
					  bool multiline = true, bool content_multiline = true)
	{
		dest << print_array_to_string (container, multiline, content_multiline);
	}

	template <typename T>
	void print_object (const T &object, bool multiline = true)
	{
		// It will automatically detect the module for type T if it exists
		// See `ObjectPrinter` for details
		dest << print_value_to_string (object, multiline);
	}

private:
	static constexpr size_t INDENT = 4;
	std::ostream &dest;

	size_t indent_level = 0;

	static void inc_indent (size_t &indent_level) { indent_level++; }
	static void dec_indent (size_t &indent_level) { if (indent_level > 0) indent_level--; }

	static void new_line (size_t indent_level, std::ostream &dest)
	{
		std::string spacer (INDENT * indent_level, ' ');
		dest << std::endl << spacer;
	}

	template <typename T>
	static std::string print_value_to_string (const T &what, bool multiline)
	{
		return ValuePrinter<T>::print_to_string (what, multiline);
	}

	template <typename T>
	static std::string print_pair_to_string (const std::string &key, const T &value, bool multiline)
	{
		return print_value_to_string (key, false) + " : "
				+ print_value_to_string (value, multiline);
	}

	template <template<class...> class Container, class Content>
	static std::string print_pair_to_string (const std::string &key, const Container <Content> &value,
											 bool multiline, bool content_multiline)
	{
		return print_value_to_string(key, false) + " : "
				+ print_array_to_string (value, multiline, content_multiline);
	}

	template <typename T>
	struct is_char_type {
		static constexpr bool value = std::is_same<T, char>::value
									  || std::is_same <T, signed char>::value
									  || std::is_same <T, unsigned char>::value;
	};

	template <typename T, typename Dummy = T>
	struct ValuePrinter
	{
		static std::string print_to_string (const T &, bool)
		{
			static_assert (sizeof(T) < 0,
						   "JsonWriter: unsupported object, define a specialization");
		}
	};

	template <typename T>
	struct ValuePrinter
	<
		T,
		typename std::enable_if <std::is_arithmetic <T>::value
								 && !is_char_type <T>::value
								 && !std::is_same <T, bool>::value, T>::type
	>
	{
		static std::string print_to_string (const T &what, bool) {
			std::ostringstream oss;
			oss << what;
			return oss.str();
		}
	};

	template <typename T>
	static std::string print_char (const T what)
	{
		static_assert (is_char_type <T>::value,
					   "Incorrect use of JsonWriter::print_char()");

		switch (what) {
		case '\t':
			return "\\t";
		case '\"':
			return "\\\"";
		case '\\':
			return "\\\\";
		case '/':
			return "\\/";
		case '\b':
			return "\\b";
		case '\f':
			return "\\f";
		case '\n':
			return "\\n";
		case '\r':
			return "\\r";
		default:
			return std::string(1, what);
		}
	}

	template <typename T>
	struct ValuePrinter
	<
		T,
		typename std::enable_if <is_char_type<T>::value, T>::type
	>
	{
		static std::string print_to_string (const T &what, bool) {
			return "\"" + print_char (what) + "\"";
		}
	};

	template <typename T>
	struct ValuePrinter
	<
		T,
		typename std::enable_if <std::is_same <T, std::string>::value, T>::type
	>
	{
		static std::string print_to_string (const std::string &what, bool)
		{
			std::string result;

			result += "\"";
			for (char c : what)
				result += print_char (c);
			result += "\"";

			return result;
		}
	};

	template <size_t N>
	struct ValuePrinter <char[N]>
	{
		static std::string print_to_string (const char what[N], bool)
		{
			return ValuePrinter<std::string>::print_to_string(std::string (what, N-1), bool());
		}
	};

	template <typename T>
	struct ValuePrinter
	<
		T,
		typename std::enable_if <std::is_same <T, bool>::value, T>::type
	>
	{
		static std::string print_to_string (const bool what, bool)
		{
			if (what)
				return "true";
			else
				return "false";
		}
	};

	/*
	 * An extension class to support custom objects
	 * `generate_object_inners()` should use `print_X_to_string()` for content generation
	*/
	template <typename T>
	struct ObjectPrinter
	{
		/*
		 * A flag for template deduction
		 * Extensions must have it set to true
		*/
		static constexpr bool is_printable = false;

		/*
		 * Generates printing instructions: an array of print_X_to_string()
		 * results.
		 * TODO: only X = pair?
		 *     TODO: some of the JsonWriter contents may need to be moved
		 *     elsewhere to leave only print_pair_to_string() accessible
		 *     to this class
		 * The `multiline` flag overrides the `multiline` setting to false
		 * for single-line printing.
		 * print_X_to_string() `multiline` properties intended to be set to
		 * true *must* be set to `multiline` to enable single-line printing.
		 * Otherwise, single-line output will be JSON-correct, but not visually
		 * structured (and not single-line).
		*/
		static std::vector <std::string> generate_object_inners (const T &what, bool multiline)
		{
			static_assert (sizeof(T) < 0,
						   "JsonWriter: unsupported object, define a specialization");
		}
	};

	template <typename T>
	struct ValuePrinter
	<
		T,
		typename std::enable_if <ObjectPrinter<T>::is_printable, T>::type
	>
	{
		static std::string print_to_string (const T &what, bool multiline)
		{
			return print_object_to_string (ObjectPrinter<T>::generate_object_inners(what, multiline), multiline);
		}
	};

	template <template<class...> class Container, class Content>
	static std::string print_array_to_string (const Container<Content> &container,
											  bool multiline, bool content_multiline,
											  size_t indent_level = 0)
	{
		std::ostringstream oss;

		oss << '[';

		if (container.size() > 0)
		{
			if (multiline) {
				inc_indent (indent_level);
				new_line (indent_level, oss);
			}

			for (auto it = container.begin(); it != container.end();) {
				std::istringstream iss ( print_value_to_string (*it, multiline && content_multiline) );
				std::string line;
				std::getline (iss, line);
				oss << line;
				while ( std::getline (iss, line) ) {
					new_line (indent_level, oss);
					oss << line;
				}

				if ( ++it != container.end() ) {
					oss << ',';
					if (multiline)
						new_line (indent_level, oss);
					else
						oss << ' ';
				}
			}

			if (multiline) {
				dec_indent (indent_level);
				new_line (indent_level, oss);
			}
		}

		oss << ']';

		return oss.str();
	}

	template <class Content, int N>
	static std::string print_array_to_string (const Content container [N],
											  bool multiline, bool content_multiline,
											  size_t indent_level = 0)
	{
		std::ostringstream oss;

		oss << '[';

		if (multiline) {
			inc_indent (indent_level);
			new_line (indent_level, oss);
		}

		for (int i = 0; i < N;) {
			std::istringstream iss ( print_value_to_string (container[i], multiline && content_multiline) );
			std::string line;
			std::getline (iss, line);
			oss << line;
			while ( std::getline (iss, line) ) {
				new_line (indent_level, oss);
				oss << line;
			}

			if (++i < N) {
				oss << ',';
				if (multiline)
					new_line (indent_level, oss);
				else
					oss << ' ';
			}
		}

		if (multiline) {
			dec_indent (indent_level);
			new_line (indent_level, oss);
		}

		oss << ']';

		return oss.str();
	}

	static std::string print_object_to_string (const std::vector <std::string> &content,
											   bool multiline, size_t indent_level = 0)
	{
		std::ostringstream oss;

		oss << '{';

		if (multiline) {
			inc_indent (indent_level);
			new_line (indent_level, oss);
		}

		for (auto it = content.begin(); it != content.end();) {
			std::istringstream iss (*it);
			std::string line;
			std::getline (iss, line);
			oss << line;
			while ( std::getline (iss, line) ) {
				new_line (indent_level, oss);
				oss << line;
			}

			if ( ++it != content.end() ) {
				oss << ',';
				if (multiline)
					new_line (indent_level, oss);
				else
					oss << ' ';
			}
		}

		if (multiline) {
			dec_indent (indent_level);
			new_line (indent_level, oss);
		}

		oss << '}';

		return oss.str();
	}
};


#endif // JSON_TOOLS

