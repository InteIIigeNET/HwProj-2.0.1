using System;
using System.Linq;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace HwProj.PageObjects
{
    public class Input
    {
        private By Element { get; }
        private readonly IWebDriver _webDriver;
        private readonly IWebElement _webElement;

        public Input(IWebDriver webDriver, string id)
        {
            _webDriver = webDriver;
            Element = By.XPath($"//input[@id='{id}']");
            _webElement = webDriver.FindElement(Element);
        }

        public void SendKeys(string text)
        {
            WaitUntil.WaitElement(_webDriver, Element, 5);
            
            _webDriver
                .FindElement(Element)
                .SendKeys(text);
        }
    }
}
