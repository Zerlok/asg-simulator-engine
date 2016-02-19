#include <sstream>
#include <fstream>
#include <stdexcept>
#include "player.h"


static const std::string ERR_CANNOT_OPEN_FILE = "Can't open file: ";


Player::Player(const Units& data)
	: _begin(data)
{
}


Player::~Player()
{
}


void Player::read_strategy_from_file(const std::string& filename)
{
	std::ifstream in(filename);

	if (!in.is_open())
	{
		std::stringstream ss;
		ss << ERR_CANNOT_OPEN_FILE << filename;
		throw std::invalid_argument(ss.str());
	}

	// TODO: Build node scheme from file.
}

