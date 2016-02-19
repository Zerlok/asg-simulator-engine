#ifndef __POINT_H__
#define __POINT_H__


#include <iostream>
#include "core/coretypes.h"


class Point
{
	public:
		static const Point zero;

		Point(const int x=zero._x, const int y=zero._y, const int z=zero._z);
		Point(const int coordinates[3]);
		Point(const Point &point);
		Point(Point &&point);
		virtual ~Point();

		int get_x() const;
		int get_y() const;
		int get_z() const;

		double distance(const Point &point) const;

		Point &operator=(const Point &point);
		Point &operator=(const int coordinates[3]);

		bool operator==(const Point &point) const;
		bool operator!=(const Point &point) const;
		bool operator==(const int coordinates[3]) const;
		bool operator!=(const int coordinates[3]) const;

		Point operator+(const Point &point) const;
		Point operator-(const Point &point) const;

		Point &operator+=(const Point &point);
		Point &operator-=(const Point &point);

		int operator[](const int i) const;
		int operator[](const char axis) const;

		friend std::ostream &operator<<(std::ostream &out, const Point &point);
		friend std::istream &operator>>(std::istream &in, Point &point);

	private:
		int _x;
		int _y;
		int _z;
};


std::ostream &operator<<(std::ostream &out, const Point &point);
std::istream &operator>>(std::istream &in, Point &point);


// __POINT_H__
#endif
