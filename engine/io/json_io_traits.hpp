#ifndef JSON_IO_TRAITS_HPP
#define JSON_IO_TRAITS_HPP

#include <forward_list>
#include <string>
#include <vector>
#include <list>
#include <map>
#include <unordered_map>


namespace JsonTraits
{
	template <typename T>
	struct is_char_type : public std::integral_constant
	<bool, std::is_same <T, char>::value
		   || std::is_same <T, signed char>::value
		   || std::is_same <T, unsigned char>::value> {};

	template <typename T>
	struct is_numeric_type : public std::integral_constant
	<bool, std::is_arithmetic <T>::value
		   && !is_char_type <T>::value
		   && !std::is_same <T, bool>::value> {};

	template <class>
	struct is_supported_container : public std::false_type {};

	template <class T>
	struct is_supported_container < std::vector <T> >
			: public std::integral_constant <bool, true> {};

	template <class T>
	struct is_supported_container < std::list <T> >
			: public std::integral_constant <bool, true> {};

	template <class T>
	struct is_supported_container < std::forward_list <T> >
			: public std::integral_constant <bool, true> {};

	template <class K, class V>
	struct is_supported_container < std::map <K, V> >
			: public std::integral_constant <bool, true> {};

	template <class K, class V>
	struct is_supported_container < std::unordered_map <K, V> >
			: public std::integral_constant <bool, true> {};
}


namespace JsonSymbols
{
	static const char space = ' ';
	static const char comma = ',';
	static const char colon = ':';
	static const char sq_bracket_left = '[';
	static const char sq_bracket_right = ']';
	static const char fig_bracket_left = '{';
	static const char fig_bracket_right = '}';

	static const char quote = '\"';
	static const char backslash = '\\';
	static const char slash = '/';
	static const char newline = '\n';
	static const char tab = '\t';
	static const char backspace = '\b';
	static const char pageskip = '\f';
	static const char trademark = '\r';

	static const std::string s_quote = "\\\"";
	static const std::string s_backslash = "\\\\";
	static const std::string s_slash = "\\/";
	static const std::string s_newline = "\\n";
	static const std::string s_tab = "\\t";
	static const std::string s_backspace = "\\b";
	static const std::string s_pageskip = "\\f";
	static const std::string s_trademark = "\\r";

	static const char e_newline = 'n';
	static const char e_tab = 't';
	static const char e_backspace = 'b';
	static const char e_pageskip = 'f';
	static const char e_trademark = 'r';
}


namespace JsonConsts
{
	static const std::string first = "first";
	static const std::string second = "second";
	static const std::string kv_sep = " : ";

	static const char zero = '0';
	static const char one = '1';
	static const std::string str_true = "true";
	static const std::string str_false = "false";
}


#endif // JSON_IO_TRAITS_HPP
