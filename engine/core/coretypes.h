#ifndef __ENGINE_TYPES_H__
#define __ENGINE_TYPES_H__


#include <iostream>
#include <string>
#include <vector>


class AbstractNode;
class AbstractUnit;
class Simulator;


using Nodes = std::vector<AbstractNode*>;
using Units = std::vector<AbstractUnit*>;
using Arguments = std::vector<std::string>;


enum class BattleSide
{
	self = 0,
	enemy
};

std::ostream& operator<<(std::ostream& out, const BattleSide& side);
std::istream& operator>>(std::istream& in, BattleSide& side);


class Battlefield
{
	public:
		// Constructors / Destructor.
		Battlefield();
		Battlefield(const Units& units1, const Units& units2);
		Battlefield(const Battlefield& data);
		Battlefield(Battlefield&& data);
		~Battlefield() {}

		// Getters.
		Units& get_units(const BattleSide& side);

		// Operators.
		Battlefield& operator=(const Battlefield& data);
		Battlefield& operator+=(const Battlefield& data);
		Units& operator[](const BattleSide& side);

		// Methods.
		void clear();
		void swap_battle_sides();

	private:
		// Fields.
		Units self_units;
		Units enemy_units;
};


class Player
{
	public:
		// Constructors / Destructor.
		Player(const Units& units = Units(), const Nodes& strategy = Nodes());
		Player(const Player& player);
		Player(Player&& player);
		~Player();

		bool is_valid() const;

		// Fields.
		Units units;
		Nodes strategy;
};


// __ENGINE_TYPES_H__
#endif

