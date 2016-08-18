#ifndef JSON_READER_HPP
#define JSON_READER_HPP

#include <istream>
#include <map>
#include <stdexcept>
#include <type_traits>
#include <utility>
#include <vector>

#include "json_io_traits.hpp"

/**
  * JsonReader - a class to read objects from streams
  * On creation it contains nothing and needs to be
  * initialized using `get_object_string ()`.
  * Uses extension classes to support various object
  * types (see "Extensions").
  *
  * Methods:
  *   - get_object_string (std::istream&): reads the
  *     anonymous global JSON object for further use.
  *     Everything before the object will be discarded.
  *   - extract_object<T> (): parses the whole anonymous
  *     object and returns an object of type T on success.
  *     On failure throws std::logic_error.
  *     May require an extension for type T (see below).
  *   - extract_field<T> (const std::string&): searches
  *     the anonymous object for a field with the
  *     specified label and returns it on parce success.
  *     On failure throws std::logic_error.
  *     May require an extension for type T (see below).
  *
  * Extensions:
  *   - Extensions for type T are structs of type
  *     `ObjectReader<T>` derived from `ObjectReaderBase<T>`.
  *   - Extensions are defined using helper macros:
  *       - `#define _JRExtType Your_Class_Here`: tells
  *         the extension listed below it the type of the
  *         target class.
  *       - JsonReaderExtension: creates the header for
  *         your extension.
  *       - JRExtInitObject: optional, starts the object
  *         creation section
  *       - JRExtGetFieldToVar(type, name): creates a
  *         variable of type `type` named `name` (surprise!)
  *         and writes data under the "name" label to it.
  *         Use it to get the fields needed to create
  *         the object.
  *       - JRExtFinishInit(...): necessary in the object
  *         creation section. Creates the object using
  *         the given parameters (typically obtained with
  *         `JRExtGetFieldToVar`) and finishes the object
  *         creation section.
  *       - JRExtFields: optional, starts the object fields
  *         section.
  *       - JRExtDefineField(name): tells the reader a field
  *         named `name` exists in the object and should
  *         be read. Used in the fields section.
  *       - JRExtEnd: finishes the extension.
  *       - `#undef _JRExt_Type`: frees `_JRExt_Type` for
  *         the later use. Optional.
  *
  * Examples:
  *
  * struct Simple { std::string name; int num; };
  *
  * #define _JRExtType Simple
  * JsonReaderExtension
  *     JRExtFields
  *         JRExtDefineField (num) // Semicolons may be omitted
  *         JRExtDefineField (name) // Field order is arbitrary
  * JRExtEnd
  * #undef _JRExtType
  *
  * struct NoDefaultCtor
  * {
  *     NoDefaultCtor (int a, int b) : a (a), b (b) {}
  *     const int a, b; int c;
  * };
  *
  * #define _JRExtType NoDefaultCtor
  * JsonReaderExtension
  *     JRExtInitObject // This object needs a custom initialization
  *         JRExtGetFieldToVar (int, a) // The name must match one in the object
  *         JRExtGetFieldToVar (int, b)
  *         JRExtFinishInit (a, b)
  *     JRExtFields
  *         JRExtDefineField (c)
  * JRExtEnd
  * #undef _JRExtType
  *
**/

#define JsonReaderExtension \
	template <> \
	struct JsonReader::ObjectReader <_JRExtType> : public JsonReader::ObjectReaderBase <_JRExtType> \
	{ \
		ObjectReader (const std::string &src, size_t start) : ObjectReaderBase <_JRExtType> (src, start) {} \
		void macro_structural_dummy () {

#define JRExtInitObject } _JRExtType create_object () {

#define JRExtFields } void read_object_inners (_JRExtType &obj) {

#define JRExtDefineField(Field_Name) obj.Field_Name = read_obj_field<decltype(obj.Field_Name)> (#Field_Name);

#define JRExtGetFieldToVar(Field_Type,Field_Name) Field_Type Field_Name = read_obj_field <Field_Type> (#Field_Name);

#define JRExtFinishInit(...) return _JRExtType (__VA_ARGS__);

#define JRExtEnd }};

class JsonReader
{
public:
	void get_object_string (std::istream &src)
	{
		object_str.clear ();

		src.ignore (std::numeric_limits<std::streamsize>::max(), '{');

		if (!src) throw std::logic_error (except_msg_read_failure);

		std::vector<bool> nesting;
		const bool NEST_ARRAY = false;
		const bool NEST_OBJECT = true;

		object_str.push_back('{');
		nesting.push_back (NEST_OBJECT);

		while (nesting.size() > 0)
		{
			if (!src) throw std::logic_error (except_msg_read_failure);

			char c = src.get();

			if ( iswspace(c) ) continue;

			object_str.push_back (c);

			switch (c)
			{
			case '\"':
				read_json_string (src, object_str);
				break;
			case '[':
				nesting.push_back (NEST_ARRAY);
				break;
			case ']':
				if (nesting [nesting.size() - 1] != NEST_ARRAY)
					throw std::logic_error (except_msg_parce_failure);
				nesting.pop_back();
				break;
			case '{':
				nesting.push_back (NEST_OBJECT);
				break;
			case '}':
				if (nesting [nesting.size() - 1] != NEST_OBJECT)
					throw std::logic_error (except_msg_parce_failure);
				nesting.pop_back();
				break;
			default:
				break;
			}
		}
	}

	template <class T>
	T extract_object ()
	{
		size_t pos = 0;
		return ValueReader<T>::read_value (object_str, pos);
	}

	template <typename T>
	void extract_object_field (const std::string &label, T &dest)
	{
		ObjectReader<T> reader (object_str, 0);
		reader.read_obj_field (label, dest);
	}

private:
	std::string object_str;

	static constexpr const char* except_msg_read_failure = "JsonReader : failed to read an object";
	static constexpr const char* except_msg_parce_failure = "JsonReader : failed to parce an object";

	static void read_json_string (std::istream &src, std::string &dest)
	{
		while (src)
		{
			if (src.peek() == '\\') {
				dest.push_back( src.get() );
				dest.push_back( src.get() );
			}
			else if (src.peek() == '\"') {
				dest.push_back( src.get() );
				return;
			}
			else {
				dest.push_back( src.get() );
			}
		}

		throw std::logic_error (except_msg_parce_failure);
	}

	static size_t skip_json_string (const std::string &src, size_t start)
	{
		while ( start < src.size() )
		{
			switch (src[start])
			{
			case '\\':
				start += 2;
				break;
			case '\"':
				return start + 1;
			default:
				++start;
			}
		}

		throw std::logic_error (except_msg_parce_failure);
	}

	template <class T>
	struct ObjectReaderBase
	{
		ObjectReaderBase (const std::string &src, size_t start)
			: src (src), start (start)
		{
			if (src.at(start) != '{')
				throw std::logic_error (except_msg_parce_failure);

			std::vector<bool> nesting;
			const bool NEST_ARRAY = false;
			const bool NEST_OBJECT = true;

			nesting.push_back (NEST_OBJECT);
			start++;

			while (nesting.size() > 0)
			{
				switch ( src.at(start) )
				{
				case '\"':
					if ( nesting.size() == 1 && (src[start - 1] == '{' || src[start - 1] == ',') )
						labels.push_back (start);
					start = skip_json_string (src, start);
					break;
				case '[':
					++start;
					nesting.push_back (NEST_ARRAY);
					break;
				case ']':
					++start;
					if (nesting [nesting.size() - 1] != NEST_ARRAY)
						throw std::logic_error (except_msg_parce_failure);
					nesting.pop_back();
					break;
				case '{':
					++start;
					nesting.push_back (NEST_OBJECT);
					break;
				case '}':
					++start;
					if (nesting [nesting.size() - 1] != NEST_OBJECT)
						throw std::logic_error (except_msg_parce_failure);
					nesting.pop_back();
					break;
				default:
					++start;
					break;
				}
			}

			stop_pos = start;
		}

		virtual ~ObjectReaderBase () {}

		T create_object () { return T(); }

		void read_object_inners (T &obj) { (void)obj; } // A workaround for the "unused parameter" warning

		template <typename Field_T>
		Field_T read_obj_field (const std::string &label)
		{
			size_t pos = start;

			std::string to_find = "\"" + label + "\"";

			auto label_it = labels.end ();

			while (label_it == labels.end () && pos < src.size () && pos != std::string::npos)
			{
				pos = src.find (to_find, pos);
				label_it = std::find (labels.begin (), labels.end (), pos);
				if (pos != std::string::npos)
					pos += to_find.size ();
			}

			if ( label_it == labels.end () )
				throw std::logic_error ( "JsonReader : failed to find field " + to_find
										 + " in \"" + src.substr (0, 10) + (src.size() > 10 ? "...\"" : "\"") );

			// `src.size ()` is the position after the last character & there must be
			// at least a ':', some contents and a '}' somewhere in the end of `src`
			// => at least 3 symbols before the `src` end
			if (*label_it + to_find.size() > src.size() - 3 || src[*label_it + to_find.size()] != ':')
				throw std::logic_error (except_msg_parce_failure);

			pos = *label_it + to_find.size() + 1;

			auto result = ValueReader<Field_T>::read_value (src, pos);

			// The architecture guarantees that `pos` is valid
			if (src[pos] != ',' && src[pos] != '}')
				throw std::logic_error (except_msg_parce_failure);

			return result;
		}

		size_t get_stop_pos () { return stop_pos; }

	private:
		const std::string &src;
		const size_t start;
		size_t stop_pos;
		std::vector <size_t> labels;
	};

	template <class T>
	struct ObjectReader : public ObjectReaderBase <T>
	{
		ObjectReader (const std::string &src, size_t start) : ObjectReaderBase <T> (src, start) {}

		void read_object_inners (T &obj)
		{
			static_assert (sizeof (T) < 0, "JsonReader: unsupported object");
		}
	};

	template <class K, class V>
	struct ObjectReader < std::pair <K, V> > : public ObjectReaderBase < std::pair <K, V> >
	{
		ObjectReader (const std::string &src, size_t start) : ObjectReaderBase < std::pair <K, V> > (src, start) {}

		std::pair <K, V> create_object ()
		{
			typedef typename std::remove_cv<K>::type first_t;
			typedef typename std::remove_cv<V>::type second_t;

			first_t first = this->template read_obj_field<first_t> ("first");
			second_t second = this->template read_obj_field<second_t> ("second");

			return {first, second};
		}
	};

	template <typename T, typename = T>
	struct ValueReader
	{
		static T read_value (const std::string &src, size_t &pos)
		{
			ObjectReader<T> reader (src, pos);
			T result = reader.create_object();
			reader.read_object_inners (result);
			pos = reader.get_stop_pos ();
			return result;
		}
	};

	template <typename T>
	struct ValueReader
	<
		T,
		typename std::enable_if <JsonTraits::is_numeric_type<T>::value, T>::type
	>
	{
		static T read_value (const std::string &src, size_t &pos)
		{
			std::istringstream iss ( src.substr(pos) );
			T result;
			iss >> result;
			pos += iss.tellg();
			return result;
		}
	};

	static char read_char (const std::string &json, size_t pos = 0)
	{
		if (json.at(pos) == '\\')
		{
			switch ( json.at(pos + 1) )
			{
			case 't':
				return '\t';
			case '\"':
				return '\"';
			case '\\':
				return '\\';
			case '/':
				return '/';
			case 'b':
				return '\b';
			case 'f':
				return '\f';
			case 'n':
				return '\n';
			case 'r':
				return '\r';
			default:
				throw std::logic_error ("JsonReader : unknown escape sequence");
			}
		}
		else
			return json.at(pos);
	}

	template <typename T>
	struct ValueReader
	<
		T,
		typename std::enable_if <JsonTraits::is_char_type<T>::value, T>::type
	>
	{
		static T read_value (const std::string &src, size_t &pos)
		{
			if (src[pos] != '\"')
				throw std::logic_error (except_msg_parce_failure);

			pos++;

			T result = read_char (src, pos);

			if (src[pos] == '\\')
				pos += 2;
			else
				pos++;

			if (src[pos] != '\"')
				throw std::logic_error (except_msg_parce_failure);

			pos++;

			return result;
		}
	};

	template <typename T>
	struct ValueReader
	<
		T,
		typename std::enable_if <std::is_same<T, std::string>::value, T>::type
	>
	{
		static std::string read_value (const std::string &src, size_t &pos)
		{
			if (src[pos] != '\"')
				throw std::logic_error (except_msg_parce_failure);

			std::string result;

			while (pos < src.size() && src[pos] != '\"')
			{
				result.push_back( read_char(src, pos) );
				if (src[pos] == '\\') pos++;
				pos++;
			}

			if (src[pos] != '\"')
				throw std::logic_error (except_msg_parce_failure);

			pos++;

			return result;
		}
	};

	template <typename T>
	struct ValueReader
	<
		T,
		typename std::enable_if <std::is_same<T, bool>::value, T>::type
	>
	{
		static bool read_value (const std::string &src, size_t &start)
		{
			if (src[start] == '0') {
				start++;
				return false;
			}
			else if (src[start] == '1') {
				start++;
				return true;
			}
			else if (src.substr (start, 5) == "false") {
				start += 5;
				return false;
			}
			else if (src.substr (start, 4) == "true") {
				start += 4;
				return true;
			}
			else {
				throw std::logic_error (except_msg_parce_failure);
			}
		}
	};

	template <typename T>
	struct ValueReader
	<
		T,
		typename std::enable_if <JsonTraits::is_supported_container<T>::value, T>::type
	>
	{
	public:
		static T read_value (const std::string &src, size_t &pos)
		{
			T result;

			if ( !(pos < src.size() && src[pos] == '[') )
				throw std::logic_error (except_msg_parce_failure);

			pos++;

			while (pos < src.size() && src[pos - 1] != ']')
			{
				auto tmp = ValueReader<typename T::value_type>::read_value (src, pos);

				if ( pos < src.size() && (src[pos] == ',' || src[pos] == ']') )
					pos++;
				else
					throw std::logic_error (except_msg_parce_failure);

				add_element (result, tmp);
			}

			return result;
		}

	private:
		template <typename G>
		static void add_element (std::vector<G> &where, const G &what)
		{
			where.push_back(what);
		}

		template <typename G>
		static void add_element (std::list<G> &where, const G &what)
		{
			where.push_back(what);
		}

		template <typename G>
		static void add_element (std::forward_list<G> &where, const G &what)
		{
			where.reverse ();
			where.push_front (what);
			where.reverse();
		}

		template <typename K, typename V>
		static void add_element (std::map<K, V> &where, std::pair<const K, V> &what)
		{
			where [what.first] = what.second;
		}

		template <typename K, typename V>
		static void add_element (std::unordered_map<K, V> &where, std::pair<const K, V> &what)
		{
			where [what.first] = what.second;
		}
	};
};

#endif // JSON_READER_HPP

