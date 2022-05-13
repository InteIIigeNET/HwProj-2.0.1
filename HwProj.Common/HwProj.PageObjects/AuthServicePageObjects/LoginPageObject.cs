using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class LoginPageObject
    {
        private readonly IWebDriver _webDriver;
        private readonly By _emailField = By.XPath("//input[@id='login-email-input']");
        private readonly By _passwordField = By.XPath("//input[@id='login-password-input']");
        private readonly By _loginButton = By.XPath("//button[@id='login-button']");
        
        public LoginPageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
        }

        public MainMenuPageObject Login(string email, string password)
        {
            _webDriver
                .FindElement(_emailField)
                .SendKeys(email);
            
            _webDriver
                .FindElement(_passwordField)
                .SendKeys(password);
            
            _webDriver
                .FindElement(_loginButton)
                .Click();
            
            return new MainMenuPageObject(_webDriver);
        }
    }
}
