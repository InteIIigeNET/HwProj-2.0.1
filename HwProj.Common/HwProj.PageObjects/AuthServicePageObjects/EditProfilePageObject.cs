using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class EditProfilePageObject
    {
        private readonly IWebDriver _webDriver;
        private Input Name { get; }
        private Input Surname { get; }
        private Input MiddleName { get; }
        private Input Password { get; }
        private Input NewPassword { get; }
        private Button EditButton { get; }

        public EditProfilePageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            Name = new Input(webDriver, "edit-name-input");
            Surname = new Input(webDriver, "edit-surname-input");
            MiddleName = new Input(webDriver, "edit-middle-name-input");
            Password = new Input(webDriver, "edit-password-input");
            NewPassword = new Input(webDriver, "edit-new-password-input");
            EditButton = new Button(webDriver, "complete-edit-profile-button");
        }

        public MainMenuPageObject EditProfile(string name, string surname, string password, string middleName = "",
            string newPassword = "")
        {
            Name.SendKeys(name);

            Surname.SendKeys(surname);

            MiddleName.SendKeys(middleName);

            Password.SendKeys(password);

            NewPassword.SendKeys(newPassword);

            EditButton.Click();

            return new MainMenuPageObject(_webDriver);
        }
    }
}
