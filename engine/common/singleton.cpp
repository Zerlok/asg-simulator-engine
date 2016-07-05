#include "singleton.h"


Singleton* Singleton::_instance = nullptr;
SingletonDestroyer Singleton::_destroyer;


Singleton* Singleton::create()
{
	if (_instance == nullptr)
	{
		_instance = new Singleton();
		_destroyer.init(_instance);
	}

	return _instance;
}


void SingletonDestroyer::init(Singleton *singleton)
{
	_singleton = singleton;
}


SingletonDestroyer::~SingletonDestroyer()
{
	delete _singleton;
}
