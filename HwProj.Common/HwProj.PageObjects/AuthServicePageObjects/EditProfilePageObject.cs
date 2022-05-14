using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class EditProfilePageObject
    {
        private readonly IWebDriver _webDriver;

        public EditProfilePageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            
        }
    }
}
