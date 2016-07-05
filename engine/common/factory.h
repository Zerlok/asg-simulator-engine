#ifndef __FACTORY_H__
#define __FACTORY_H__


template<class DataKey, class DataCls>
class Factory;

#include <sstream>
#include <stdexcept>
#include <vector>
#include <unordered_map>
#include "core/types.h"


static const std::string ERR_KEY_NOT_FOUND = "The key is not registered: ";


template<class BaseCls>
class AbstractClassCreator
{
	public:
		AbstractClassCreator() {}
		virtual ~AbstractClassCreator() {}
		virtual BaseCls* create() const = 0;
		virtual BaseCls* create(const Arguments& args) const = 0;
};


template<class BaseCls, class DerivedCls>
class DerivedClassCreator : public AbstractClassCreator<BaseCls>
{
	public:
		DerivedClassCreator() {}
		virtual ~DerivedClassCreator() {}

		BaseCls* create() const override
		{
			return new DerivedCls();
		}
		BaseCls* create(const Arguments& args) const override
		{
			return new DerivedCls(args);
		}
};


template<class K, class B>
class Factory
{
	public:
		using Key = K;
		using BaseCls = B;
		using BaseCreator = AbstractClassCreator<BaseCls>;
		using CreatorsMap = std::unordered_map<Key, BaseCreator*>;
		using Keys = std::vector<Key>;

		Factory() {}
		~Factory()
		{
			for (const typename CreatorsMap::value_type& pair : _creators)
				delete pair.second;
		}

		template<class DerivedCls>
		bool registerate(const Key& key)
		{
			if (_creators.find(key) != _creators.end())
				return false;

			_creators.insert({key, new DerivedClassCreator<BaseCls, DerivedCls>()});
			return true;
		}

		BaseCls* create(const Key& key) const
		{
			typename CreatorsMap::const_iterator it = _creators.find(key);

			if (it == _creators.end())
			{
				std::stringstream ss;
				ss << ERR_KEY_NOT_FOUND << key;
				throw std::invalid_argument(ss.str());
			}

			return ((it->second)->create());
		}

		BaseCls* create(const Key &key, const Arguments& args) const
		{
			typename CreatorsMap::const_iterator it = _creators.find(key);

			if (it == _creators.end())
			{
				std::stringstream ss;
				ss << ERR_KEY_NOT_FOUND << key;
				throw std::invalid_argument(ss.str());
			}

			if (args.empty())
				return ((it->second)->create());

			else
				return ((it->second)->create(args));
		}

		Keys get_registered() const
		{
			Keys keys(_creators.size());

			for (const typename CreatorsMap::value_type& pair : _creators)
				keys.push_back(pair.first);

			return std::move(keys);
		}

	private:
		Factory(const Factory<Key, BaseCls>& factory);

		CreatorsMap _creators;
};


// __FACTORY_H__
#endif
