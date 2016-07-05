#ifndef __ENGINE_TYPES_H__
#define __ENGINE_TYPES_H__


#include <iostream>
#include <string>
#include <vector>


// ---------- BASIC TYPES ---------- //

class NodeData;
class AbstractNode;
class AbstractUnit;

using Nodes = std::vector<AbstractNode*>;
using Units = std::vector<AbstractUnit*>;
using Arguments = std::vector<std::string>;


// ---------- BATTLE PLAYERS' SIDES ENUM ---------- //

enum class BattleSide
{
	self = 0,
	enemy
};

std::ostream& operator<<(std::ostream& out, const BattleSide& side);
std::istream& operator>>(std::istream& in, BattleSide& side);


// ---------- NODE DATA ---------- //

class NodeData
{
	public:
		// Constructors / Destructor.
		NodeData();
		NodeData(const Units& units1, const Units& units2);
		NodeData(const NodeData& data);
		NodeData(NodeData&& data);
		~NodeData() {}

		// Getters.
		bool is_empty() const;
		Units& get_units(const BattleSide& side);

		// Operators.
		NodeData& operator=(const NodeData& data);
		Units& operator[](const BattleSide& side);

		// Methods.
		void clear();
		void swap_sides();

	private:
		// Fields.
		Units self_units;
		Units enemy_units;
};


// ---------- PLAYER UNITS AND STRATEGY CONTAINER ---------- //

class Player
{
	public:
		// Constructors / Destructor.
		Player(const Units& units = Units(), const Nodes& strategy = Nodes());
		Player(const Player& player);
		Player(Player&& player);
		~Player();

		// Methods.
		bool is_valid() const;

		// Fields.
		Units units;
		Nodes strategy;
};


// __ENGINE_TYPES_H__
#endif

