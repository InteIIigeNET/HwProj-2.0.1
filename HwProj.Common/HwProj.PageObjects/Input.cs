using System.Linq;
using OpenQA.Selenium;

namespace HwProj.PageObjects
{
    public class Input
    {
        private By Element { get; }
        private readonly IWebDriver _webDriver;

        public Input(IWebDriver webDriver, string id)
        {
            _webDriver = webDriver;
            Element = By.XPath($"//input[@id='{id}']");
        }

        public void SendKeys( string text)
        {
            _webDriver
                .FindElement(Element)
                .SendKeys(text);
        }
    }
}
