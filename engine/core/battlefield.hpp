#ifndef __BATTLEFIELD_HPP__
#define __BATTLEFIELD_HPP__


#include "data.hpp"


class Battlefield
{
	public:
		enum class Side : char
		{
			ATTACKER = 'A',
			DEFENDER = 'D'
		};

		Battlefield(const size_t& width,
					const size_t& height,
					const Units& attackers,
					const Units& defenders);
		~Battlefield();

		bool has_own_Units() const;
		bool has_enemy_Units() const;

		size_t get_round_num() const;
		const Side& get_current_side() const;
		const Units& get_own_units() const;
		const Units& get_enemy_units() const;

		void next_round(); // TODO: swap sides, inc round.
		void clear(); // TODO: remove all Units.

	private:
		size_t _roundNum;	// Current round number.
		Side _currentSide;	// Attacker or Defender.
		Units _own;			// all units on own side.
		Units _enemies;		// all units on enemy side.
};


#endif // __BATTLEFIELD_HPP__
