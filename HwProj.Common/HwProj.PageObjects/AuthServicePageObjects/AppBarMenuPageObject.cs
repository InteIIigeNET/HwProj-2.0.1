using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class AppBarMenuPageObject
    {
        private readonly IWebDriver _webDriver;
        private Button ProfileButton { get; }
        private Button EditProfileButton { get; }
        private Button SignOffButton { get; }

        public AppBarMenuPageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            ProfileButton = new Button(webDriver, "profile-button");
            EditProfileButton = new Button(webDriver, "edit-profile-button");
            SignOffButton = new Button(webDriver, "sign-off-button");
        }

        public ProfilePageObject MoveToProfile()
        {
            ProfileButton.Click();

            return new ProfilePageObject(_webDriver);
        }

        public EditProfilePageObject MoveToEditProfile()
        {
            ProfileButton.Click();

            return new EditProfilePageObject(_webDriver);
        }
        
        public MainMenuPageObject SignOff()
        {
            SignOffButton.Click();

            return new MainMenuPageObject(_webDriver);
        }
    }
}
