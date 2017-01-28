#ifndef __SINGLETON_H__
#define __SINGLETON_H__


class Singleton;


class SingletonDestroyer
{
	public:
		SingletonDestroyer() {}
		~SingletonDestroyer();

		void init(Singleton* singleton);

	private:
		Singleton* _singleton;
};


class Singleton
{
	public:
		static Singleton* create();

	protected:
		Singleton() {}
		Singleton(const Singleton& singleton);
		~Singleton() {}

		Singleton& operator=(const Singleton& singleton);

		friend class SingletonDestroyer;

	private:
		static Singleton* _instance;
		static SingletonDestroyer _destroyer;
};


// __SINGLETON_H__
#endif
