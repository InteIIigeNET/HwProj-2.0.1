using System;
using System.Linq.Expressions;

namespace HwProj.NotificationsService.API.Repositories
{
    public abstract class NotificationsSpecification<T> : INotificationsSpecification<T>
    {
        public abstract Expression<Func<T, bool>> ToExpression();

        public bool IsSatisfiedBy(T entity)
        {
            Func<T, bool> predicate = ToExpression().Compile();
            return predicate(entity);
        }

        public NotificationsSpecification<T> And(NotificationsSpecification<T> specification)
        {
            return new AndSpecification<T>(this, specification);
        }

        public NotificationsSpecification<T> Or(NotificationsSpecification<T> specification)
        {
            return new OrSpecification<T>(this, specification);
        }
    }

    public class AndSpecification<T> : NotificationsSpecification<T>
    {
        private readonly NotificationsSpecification<T> _left;
        private readonly NotificationsSpecification<T> _right;


        public AndSpecification(NotificationsSpecification<T> left, NotificationsSpecification<T> right)
        {
            _right = right;
            _left = left;
        }


        public override Expression<Func<T, bool>> ToExpression()
        {
            Expression<Func<T, bool>> leftExpression = _left.ToExpression();
            Expression<Func<T, bool>> rightExpression = _right.ToExpression();

            var paramExpr = Expression.Parameter(typeof(T));
            var exprBody = Expression.AndAlso(leftExpression.Body, rightExpression.Body);
            exprBody = (BinaryExpression)new ParameterReplacer(paramExpr).Visit(exprBody);
            var finalExpr = Expression.Lambda<Func<T, bool>>(exprBody, paramExpr);

            return finalExpr;
        }
    }


    public class OrSpecification<T> : NotificationsSpecification<T>
    {
        private readonly NotificationsSpecification<T> _left;
        private readonly NotificationsSpecification<T> _right;


        public OrSpecification(NotificationsSpecification<T> left, NotificationsSpecification<T> right)
        {
            _right = right;
            _left = left;
        }


        public override Expression<Func<T, bool>> ToExpression()
        {
            var leftExpression = _left.ToExpression();
            var rightExpression = _right.ToExpression();
            var paramExpr = Expression.Parameter(typeof(T));
            var exprBody = Expression.OrElse(leftExpression.Body, rightExpression.Body);
            exprBody = (BinaryExpression)new ParameterReplacer(paramExpr).Visit(exprBody);
            var finalExpr = Expression.Lambda<Func<T, bool>>(exprBody, paramExpr);

            return finalExpr;
        }
    }
}

