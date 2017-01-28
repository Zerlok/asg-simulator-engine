#ifndef __NODE_EXPRESSION_H__
#define __NODE_EXPRESSION_H__


/*
 * Inputs:
 * x, y - ships or value. TODO: convert ships to value (count)
 *
 * Output:
 * result (1 - true, 0 - false)
 *
 * Expressions list:
 * Numerical:
 * eq(x, y)		-> (x == y)
 * ne(x, y)		-> (x != y)
 * lt(x, y)		-> (x < y)
 * gt(x, y)		-> (x > y)
 * le(x, y)		-> (x <= y)
 * ge(x, y)		-> (x >= y)
 * Boolean:
 * not(x)		-> !(x)
 * and(x, y)	-> (x && y)
 * or(x, y)		-> (x || y)
 * xor(x, y)	-> ((x && !y) || (!x && y))
 */
class NodeExpression
{
	public:
		NodeExpression();

		virtual bool val() const = 0;
};


// __NODE_EXPRESSION_H__
#endif
