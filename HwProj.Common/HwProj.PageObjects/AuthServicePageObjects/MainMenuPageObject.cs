using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class MainMenuPageObject
    {
        private readonly IWebDriver _webDriver;
        private readonly By _signInButton = By.XPath("//button[@id='sign-in-button']");
        private readonly By _signUpButton = By.XPath("//button[@id='sign-up-button']");
        
        
        public MainMenuPageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
        }

        public LoginPageObject MoveToLogin()
        {
            _webDriver.FindElement(_signInButton).Click();

            return new LoginPageObject(_webDriver);
        }
        
        public RegisterPageObject MoveToRegister()
        {
            _webDriver.FindElement(_signUpButton).Click();

            return new RegisterPageObject(_webDriver);
        }
    }
}
