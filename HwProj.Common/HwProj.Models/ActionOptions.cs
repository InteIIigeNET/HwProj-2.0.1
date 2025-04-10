namespace HwProj.Models
{
    public class ActionOptions
    {
        public bool SendNotification { get; set; }
        public static ActionOptions Default => new ActionOptions();
    }
}
