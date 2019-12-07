namespace HwProj.NotificationsService.API.Repositories
{
    public interface INotificationsSpecification<T>
    {
        bool IsSatisfiedBy(T entity);
        NotificationsSpecification<T> And(NotificationsSpecification<T> entity);
        NotificationsSpecification<T> Or(NotificationsSpecification<T> entity);
    }
}
