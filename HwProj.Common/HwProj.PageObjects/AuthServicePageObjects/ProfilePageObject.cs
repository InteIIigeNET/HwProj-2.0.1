using OpenQA.Selenium;

namespace HwProj.PageObjects.AuthServicePageObjects
{
    public class ProfilePageObject
    {
        private readonly IWebDriver _webDriver;

        public ProfilePageObject(IWebDriver webDriver)
        {
            _webDriver = webDriver;
            
        }
    }
}
