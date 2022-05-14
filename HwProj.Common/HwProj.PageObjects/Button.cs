using System.Threading;
using OpenQA.Selenium;

namespace HwProj.PageObjects
{
    public class Button
    {
        private By Element { get; }
//        private readonly IWebDriver _webDriver;
        private readonly IWebElement _webElement;
        public Button(IWebDriver webDriver, string id)
        {
//            _webDriver = webDriver;
            Element = By.XPath($"//button[@id='{id}']");
            _webElement = webDriver.FindElement(Element);
        }

        public void Click()
        {
            _webElement
                .Click();
        }
    }
}
