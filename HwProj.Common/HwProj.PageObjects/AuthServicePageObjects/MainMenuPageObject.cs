using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class MainMenuPageObject
    {
        private readonly IWebDriver _webDriver;
        private Button SignInButton { get; }
        private Button SignUpButton { get; }


        public MainMenuPageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            SignInButton = new Button(webDriver, "sign-in-button");
            SignUpButton = new Button(webDriver, "sign-up-button");
        }

        public LoginPageObject MoveToLogin()
        {
            SignInButton.Click();

            return new LoginPageObject(_webDriver);
        }
        
        public RegisterPageObject MoveToRegister()
        {
            SignUpButton.Click();

            return new RegisterPageObject(_webDriver);
        }
    }
}
