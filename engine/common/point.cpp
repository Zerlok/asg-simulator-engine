#include <iomanip>
#include "math.h"
#include "point.h"


const Point Point::zero = Point(0, 0, 0);

Point::Point(const int x, const int y, const int z)
	: _x(x), _y(y), _z(z)
{
}


Point::Point(const int cordinates[3])
	: _x(cordinates[0]), _y(cordinates[1]), _z(cordinates[2])
{
}


Point::Point(const Point &point)
	: _x(point._x), _y(point._y), _z(point._z)
{
}


Point::Point(Point&& point)
	: _x(std::move(point._x)), _y(std::move(point._y)), _z(std::move(point._z))
{
}


Point::~Point()
{
}


int Point::get_x() const
{
	return _x;
}


int Point::get_y() const
{
	return _y;
}


int Point::get_z() const
{
	return _z;
}


double Point::distance(const Point &point) const
{
	return sqrt(pow((_x - point._x), 2) + pow((_y - point._y), 2) + pow((_z - point._z), 2));
}


Point &Point::operator=(const Point &point)
{
	_x = point._x;
	_y = point._y;
	_z = point._z;

	return (*this);
}


Point &Point::operator=(const int coordinates[3])
{
	_x = coordinates[0];
	_y = coordinates[1];
	_z = coordinates[2];

	return (*this);
}


bool Point::operator==(const Point &point) const
{
	return ((_x == point._x)
			&& (_y == point._y)
			&& (_z == point._z));
}


bool Point::operator!=(const Point &point) const
{
	return !(this->operator==(point));
}


bool Point::operator==(const int coordinates[3]) const
{
	return ((_x == coordinates[0])
			&& (_y == coordinates[1])
			&& (_z == coordinates[2]));
}


bool Point::operator!=(const int coordinates[3]) const
{
	return !((*this) == coordinates);
}


Point Point::operator+(const Point &point) const
{
	return std::move(Point((_x + point._x), (_y + point._y), (_z + point._z)));
}


Point Point::operator-(const Point &point) const
{
	return std::move(Point((_x - point._x), (_y - point._y), (_z - point._z)));
}


Point &Point::operator+=(const Point &point)
{
	_x += point._x;
	_y += point._y;
	_z += point._z;

	return (*this);
}


Point &Point::operator-=(const Point &point)
{
	_x = point._x;
	_y = point._y;
	_z = point._z;

	return (*this);
}


int Point::operator[](const int i) const
{
	switch (i)
	{
		case 0: return get_x();
		case 1: return get_y();
		case 2: return get_z();
		default: return 0;
	}
}


int Point::operator[](const char axis) const
{
	if (axis == 'x')
		return get_x();

	if (axis == 'y')
		return get_y();

	if (axis == 'z')
		return get_z();

	return 0;
}


std::ostream &operator<<(std::ostream &out, const Point &point)
{
	return out << "[" << point._x
			   << ", " << point._y
			   << ", " << point._z
			   << "]";
}


std::istream& operator>>(std::istream &in, Point &point)
{
	char buffer;

	in >> buffer;
	in >> point._x;
	in >> buffer >> buffer;
	in >> point._y;
	in >> buffer >> buffer;
	in >> point._z;

	return in;
}
