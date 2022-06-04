using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class AppBarMenuPageObject
    {
        private readonly IWebDriver _webDriver;
        private ListElement InviteLecturerButton { get; }
        private ListElement ProfileButton { get; }
        private ListElement EditProfileButton { get; }
        private ListElement SignOffButton { get; }

        public AppBarMenuPageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            ProfileButton = new ListElement(webDriver, "profile-button");
            InviteLecturerButton = new ListElement(webDriver, "invite-lecturer-button");
            EditProfileButton = new ListElement(webDriver, "edit-profile-button");
            SignOffButton = new ListElement(webDriver, "sign-off-button");
        }

        public ProfilePageObject MoveToProfile()
        {
            ProfileButton.Click();
            
            return new ProfilePageObject(_webDriver);
        }

        public InviteLecturerPageObject MoveToInviteLecturer()
        {
            InviteLecturerButton.Click();

            return new InviteLecturerPageObject(_webDriver);
        }

        public EditProfilePageObject MoveToEditProfile()
        {
            EditProfileButton.Click();

            return new EditProfilePageObject(_webDriver);
        }
        
        public MainMenuPageObject SignOff()
        {
            SignOffButton.Click();

            return new MainMenuPageObject(_webDriver);
        }
    }
}
