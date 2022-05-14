using System.Threading;
using OpenQA.Selenium;

namespace HwProj.PageObjects
{
    public class Button
    {
        private By Element { get; }
        private readonly IWebDriver _webDriver;

        public Button(IWebDriver webDriver, string id)
        {
            _webDriver = webDriver;
            Element = By.XPath($"//button[@id='{id}']");
        }

        public void Click()
        {
            WaitUntil.WaitElement(_webDriver, Element, 5);

            _webDriver
                .FindElement(Element)
                .Click();
        }
    }
}
