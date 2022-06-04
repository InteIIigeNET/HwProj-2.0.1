using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class ProfilePageObject
    {
        private readonly IWebDriver _webDriver;

        private Text FullName { get; }
        private Text Email { get; }

        public ProfilePageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            FullName = new Text(webDriver, "full-name-text");
            Email = new Text(webDriver, "email-text");
        }

        public string GetProfileData()
        {
            return FullName.GetText() + " " + Email.GetText();
        }
    }
}
