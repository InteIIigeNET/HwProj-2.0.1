using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class InviteLecturerPageObject
    {
        private readonly IWebDriver _webDriver;
        private Input Email { get; }
        private Button InviteButton { get; }
        private Button CloseButton { get; }
        private Text Success { get; }
        private Text Error { get; }

        public InviteLecturerPageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            Email = new Input(webDriver, "invite-lecturer-email-input");
            InviteButton = new Button(webDriver, "invite-lecturer-button");
            CloseButton = new Button(webDriver, "close-invite-lecturer-form-button");
            Success = new Text(webDriver, "invite-lecturer-success");
            Error = new Text(webDriver, "invite-lecturer-error");
        }

        public InviteLecturerPageObject InviteLecturer(string email)
        {
            Email.Enter(email);
            
            InviteButton.Click();

            return new InviteLecturerPageObject(_webDriver);
        }

        public MainMenuPageObject Close()
        {
            CloseButton.Click();

            return new MainMenuPageObject(_webDriver);
        }

        public string GetSuccess()
        {
            return Success.GetText();
        }
        
        public string GetError()
        {
            return Error.GetText();
        }
    }
}
