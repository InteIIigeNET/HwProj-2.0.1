using HwProj.NotificationsService.API.Models;
using System;
using System.Linq.Expressions;

namespace HwProj.NotificationsService.API.Repositories
{
    public  class ParameterReplacer : ExpressionVisitor
    {
        private readonly ParameterExpression _parameter;

        protected internal ParameterReplacer(ParameterExpression parameter)
        {
            _parameter = parameter;
        }
    }

    public abstract class Specification 
    {
        public abstract Expression<Func<NotificationFilter, bool>> ToExpression();

        public bool IsSatisfiedBy(NotificationFilter filter)
        {
            Func<NotificationFilter, bool> predicate = ToExpression().Compile();
            return predicate(filter);
        }

        public Specification And(Specification specification)
        {
            return new And(this, specification);
        }
    }

    public class And : Specification
    {
        private readonly Specification _left;
        private readonly Specification _right;

        public And(Specification left, Specification right)
        {
            _right = right;
            _left = left;
        }

        public override Expression<Func<NotificationFilter, bool>> ToExpression()
        {
            Expression<Func<NotificationFilter, bool>> leftExpression = _left.ToExpression();
            Expression<Func<NotificationFilter, bool>> rightExpression = _right.ToExpression();
            var paramExpression = Expression.Parameter(typeof(Notification));
            var expressionBody = Expression.AndAlso(leftExpression.Body, rightExpression.Body);
            expressionBody = (BinaryExpression)new ParameterReplacer(paramExpression).Visit(expressionBody);
            var finalExpression = Expression.Lambda<Func<NotificationFilter, bool>>(expressionBody, paramExpression);

            return finalExpression;
        }
    }

   
    }
}

