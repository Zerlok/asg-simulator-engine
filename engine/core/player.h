#ifndef __PLAYER_H__
#define __PLAYER_H__


#include <string>
#include "node/null_node.h"
#include "simulator.h"


class Player
{
	public:
		Player(const Units& data, const );
		~Player();

	private:
		NullNode _begin;
};


// __PLAYER_H__
#endif
