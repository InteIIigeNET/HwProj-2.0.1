using HwProj.NotificationsService.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace HwProj.NotificationsService.API.Repositories
{
    public class ReplaceExpressionVisitor
        : ExpressionVisitor
    {
        private readonly Expression _oldValue;
        private readonly Expression _newValue;

        public ReplaceExpressionVisitor(Expression oldValue, Expression newValue)
        {
            _oldValue = oldValue;
            _newValue = newValue;
        }

        public override Expression Visit(Expression node)
        {
            if (node == _oldValue)
                return _newValue;
            return base.Visit(node);
        }
    }

    public abstract class Specification<T>
    {
        public abstract Expression<Func<T, bool>> ToExpression();

        public bool IsSatisfiedBy(T notification)
        {
            Func<T, bool> predicate = ToExpression().Compile();
            return predicate(notification);
        }

        public Specification<T> And(Specification<T> specification)
        {
            return new And<T>(this, specification);
        }
    }

    public class And<T> : Specification<T>
    {
        private readonly Specification<T> _left;
        private readonly Specification<T> _right;

        public And(Specification<T> left, Specification<T> right)
        {
            _left = left;
            _right = right;
        }

        public static Expression<Func<T, bool>> CombinePredicates(IList<Expression<Func<T, bool>>> predicateExpressions, Func<Expression, Expression, BinaryExpression> logicalFunction)
        {
            Expression<Func<T, bool>> filter = null;

            if (predicateExpressions.Count > 0)
            {
                var firstPredicate = predicateExpressions[0];
                Expression body = firstPredicate.Body;
                for (int i = 1; i < predicateExpressions.Count; i++)
                {
                    body = logicalFunction(body, Expression.Invoke(predicateExpressions[i], firstPredicate.Parameters));
                }
                filter = Expression.Lambda<Func<T, bool>>(body, firstPredicate.Parameters);
            }

            return filter;
        }

        public override Expression<Func<T, bool>> ToExpression()
        {
            Expression<Func<T, bool>> leftExpression = _left.ToExpression();
            Expression<Func<T, bool>> rightExpression = _right.ToExpression();
            var sum = Expression.AndAlso(leftExpression.Body, Expression.Invoke(rightExpression, leftExpression.Parameters[0])); // here is the magic
            var sumExpr = Expression.Lambda(sum, leftExpression.Parameters);
            var listOfPredicates = new List<Expression<Func<T, bool>>>();
            listOfPredicates.Add(leftExpression);
            listOfPredicates.Add(rightExpression);
            var result = CombinePredicates(listOfPredicates, Expression.AndAlso);
            return result;
        }
    }
}

