using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace HwProj.PageObjects
{
    public static class WaitUntil
    {
        public static void WaitElement(IWebDriver driver, By element, int time)
        {
            new WebDriverWait(driver, TimeSpan.FromSeconds(time))
                .Until((drv) => drv.FindElement(element));
        }
    }
}
