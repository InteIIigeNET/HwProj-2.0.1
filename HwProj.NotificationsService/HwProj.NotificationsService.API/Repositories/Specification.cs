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
        public abstract Expression<Func<Notification, bool>> ToExpression();

        public bool IsSatisfiedBy(Notification notification)
        {
            Func<Notification, bool> predicate = ToExpression().Compile();
            return predicate(notification);
        }

        public Specification And(Specification specification)
        {
            return new AndSpecification(this, specification);
        }

        public Specification Or(Specification specification)
        {
            return new OrSpecification(this, specification);
        }
    }

    public class AndSpecification : Specification
    {
        private readonly Specification _left;
        private readonly Specification _right;


        public AndSpecification(Specification left, Specification right)
        {
            _right = right;
            _left = left;
        }


        public override Expression<Func<Notification, bool>> ToExpression()
        {
            Expression<Func<Notification, bool>> leftExpression = _left.ToExpression();
            Expression<Func<Notification, bool>> rightExpression = _right.ToExpression();

            var paramExpr = Expression.Parameter(typeof(Notification));
            var exprBody = Expression.AndAlso(leftExpression.Body, rightExpression.Body);
            exprBody = (BinaryExpression)new ParameterReplacer(paramExpr).Visit(exprBody);
            var finalExpr = Expression.Lambda<Func<Notification, bool>>(exprBody, paramExpr);

            return finalExpr;
        }
    }


    public class OrSpecification : Specification
    {
        private readonly Specification _left;
        private readonly Specification _right;


        public OrSpecification(Specification left, Specification right)
        {
            _right = right;
            _left = left;
        }


        public override Expression<Func<Notification, bool>> ToExpression()
        {
            var leftExpression = _left.ToExpression();
            var rightExpression = _right.ToExpression();
            var paramExpr = Expression.Parameter(typeof(Notification));
            var exprBody = Expression.OrElse(leftExpression.Body, rightExpression.Body);
            exprBody = (BinaryExpression)new ParameterReplacer(paramExpr).Visit(exprBody);
            var finalExpr = Expression.Lambda<Func<Notification, bool>>(exprBody, paramExpr);

            return finalExpr;
        }
    }
}

