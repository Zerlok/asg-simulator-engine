#ifndef JSON_IO_TRAITS_HPP
#define JSON_IO_TRAITS_HPP

#include <forward_list>
#include <list>
#include <map>
#include <vector>
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

#endif // JSON_IO_TRAITS_HPP

