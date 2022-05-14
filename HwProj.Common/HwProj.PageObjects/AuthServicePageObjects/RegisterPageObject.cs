using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class RegisterPageObject
    {
        private readonly IWebDriver _webDriver;
        private Input Name { get; }
        private Input Surname { get; }
        private Input MiddleName { get; }
        private Input Email { get; }
        private Input Password { get; }
        private Input ConfirmPassword { get; }
        private Button RegisterButton { get; }

        public RegisterPageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            Name = new Input(webDriver, "register-name-input");
            Surname = new Input(webDriver, "register-surname-input");
            MiddleName = new Input(webDriver, "register-middle-name-input");
            Email = new Input(webDriver, "register-email-input");
            Password = new Input(webDriver, "register-password-input");
            ConfirmPassword = new Input(webDriver, "register-confirm-password-input");
            RegisterButton = new Button(webDriver, "register-button");
        }

        public MainMenuPageObject Register(string name, string surname, string email, string password,
            string confirmPassword, string middleName = "")
        {
            Name.SendKeys(name);
            
            Surname.SendKeys(surname);

            MiddleName.SendKeys(middleName);
            
            Email.SendKeys(email);

            Password.SendKeys(password);

            ConfirmPassword.SendKeys(confirmPassword);
            
            RegisterButton.Click();

            return new MainMenuPageObject(_webDriver);
        }
    }
}
