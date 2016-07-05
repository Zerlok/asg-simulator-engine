#ifndef __NODE_EXPRESSION_H__
#define __NODE_EXPRESSION_H__


// units select enemy -> count -> if > 6

/* Expressinos
 * eq
 * neq
 * gt
 * ge
 * lt
 * le
 *
 */

class NodeExpression
{
	public:
		NodeExpression();

		virtual bool val() const = 0;
};


// __NODE_EXPRESSION_H__
#endif
