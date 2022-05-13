using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class RegisterPageObject
    {
        private readonly IWebDriver _webDriver;
        private readonly By _nameField = By.XPath("//input[@id='register-name-input']");
        private readonly By _surnameField = By.XPath("//input[@id='register-surname-input']");
        private readonly By _middleNameField = By.XPath("//input[@id='register-middle-name-input']");
        private readonly By _emailField = By.XPath("//input[@id='register-email-input']");
        private readonly By _passwordField = By.XPath("//input[@id='register-password-input']");
        private readonly By _confirmPasswordField = By.XPath("//input[@id='register-confirm-password-input']");
        private readonly By _registerButton = By.XPath("//button[@id='register-button']");

        public RegisterPageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
        }

        public MainMenuPageObject Register(string name, string surname, string email, string password,
            string confirmPassword, string middleName = "")
        {
            _webDriver
                .FindElement(_nameField)
                .SendKeys(name);

            _webDriver
                .FindElement(_surnameField)
                .SendKeys(surname);
            
            _webDriver
                .FindElement(_middleNameField)
                .SendKeys(middleName);

            _webDriver
                .FindElement(_emailField)
                .SendKeys(email);
            
            _webDriver
                .FindElement(_passwordField)
                .SendKeys(password);

            _webDriver
                .FindElement(_confirmPasswordField)
                .SendKeys(confirmPassword);
            
            _webDriver
                .FindElement(_registerButton)
                .Click();

            return new MainMenuPageObject(_webDriver);
        }
    }
}
