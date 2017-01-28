#ifndef __ABSTRACT_PORT_H__
#define __ABSTRACT_PORT_H__


#include <vector>
#include "core/data.hpp"


/*
 * Port is a single handle, which can either receive or return data.
 */
class AbstractPort
{
	public:
		AbstractPort() {}
		virtual ~AbstractPort() {}

		DataHolder& get() { return _data; }
		const DataHolder& get() const { return _data; }
		void set(const DataHolder& data) { _data = data; }
		void set(DataHolder&& data) { _data = data; }

		virtual bool link(AbstractPort& port) = 0;
		virtual bool unlink(AbstractPort& port) = 0;
		virtual bool push() = 0;
		virtual bool receive(const DataHolder& data) = 0;

	protected:
		DataHolder _data;
};

using Ports = std::vector<AbstractPort*>;


template<class T>
class InputPort : public AbstractPort
{
	public:
		InputPort(const DataHolder::Type& type, T& ref);
		~InputPort();

		bool link(AbstractPort&) override { return false; }
		bool unlink(AbstractPort&) override { return false; }
		bool push() override { return false; }
		bool receive(const DataHolder& data) override
		{
			if (_type == data.get_type())
				_ref = data.get<T>(_type);

			return true;
		}

	private:
		const DataHolder::Type _type;
		T& _ref;
};


template<class T>
class OutputPort : public AbstractPort
{
	public:
		using List = std::list<AbstractPort*>;

		OutputPort(const DataHolder::Type& type, T& ref);
		~OutputPort();

		bool link(AbstractPort& port) override
		{
			_linked.push_back(&port);
			return true;
		}
		bool unlink(AbstractPort&) override
		{
			return false;
		}

		bool push() override
		{
			_data.set(_type, _ref);
			for (InputPort* port : _linked)
				port->receive(_data);

			return true;
		}
		bool receive(const DataHolder&) override { return false; }

	private:
		const DataHolder::Type _type;
		T& _ref;
		List _linked;
};


// __ABSTRACT_PORT_H__
#endif
