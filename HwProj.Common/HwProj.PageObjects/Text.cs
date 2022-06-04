using OpenQA.Selenium;

namespace HwProj.PageObjects
{
    public class Text
    {
        private By Element { get; }
        private readonly IWebDriver _webDriver;

        public Text(IWebDriver webDriver, string id)
        {
            _webDriver = webDriver;
            Element = By.XPath($"//p[@id='{id}']");
        }

        public string GetText()
        {
            WaitUntil.WaitElement(_webDriver, Element, 5);
            
            return _webDriver.FindElement(Element).Text;
        }
    }
}
