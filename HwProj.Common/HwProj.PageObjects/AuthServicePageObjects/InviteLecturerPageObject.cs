using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class InviteLecturerPageObject
    {
        private readonly IWebDriver _webDriver;
        private Input Email { get; }
        private Button InviteButton { get; }
        private Button CloseButton { get; }
        private Text Result { get; }

        public InviteLecturerPageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            Email = new Input(webDriver, "invite-lecturer-email-input");
            InviteButton = new Button(webDriver, "invite-lecturer-button");
            CloseButton = new Button(webDriver, "close-invite-lecturer-form-button");
            Result = new Text(webDriver, "invite-lecturer-result");
        }


        public InviteLecturerPageObject InviteLecturer(string email)
        {
            Email.SendKeys(email);

            InviteButton.Click();

            return new InviteLecturerPageObject(_webDriver);
        }

        public MainMenuPageObject Close()
        {
            CloseButton.Click();

            return new MainMenuPageObject(_webDriver);
        }

        public string GetResult()
        {
            return Result.GetText();
        }
    }
}
