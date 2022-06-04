using OpenQA.Selenium;

namespace HwProj.PageObjects
{
    public class ListElement
    {
        private By Element { get; }
        private readonly IWebDriver _webDriver;

        public ListElement(IWebDriver webDriver, string id)
        {
            _webDriver = webDriver;
            Element = By.XPath($"//li[@id='{id}']");
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
