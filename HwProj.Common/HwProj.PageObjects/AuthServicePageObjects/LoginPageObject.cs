using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class LoginPageObject
    {
        private readonly IWebDriver _webDriver;
        private Input Email { get; }
        private Input Password { get; }
        private Button LoginButton { get; }

        public LoginPageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            Email = new Input(webDriver, "login-email-input");
            Password = new Input(webDriver, "login-password-input");
            LoginButton = new Button(webDriver, "login-button");
        }

        public MainMenuPageObject Login(string email, string password)
        {
            Email.SendKeys(email);

            Password.SendKeys(password);

            LoginButton.Click();

            return new MainMenuPageObject(_webDriver);
        }
    }
}
