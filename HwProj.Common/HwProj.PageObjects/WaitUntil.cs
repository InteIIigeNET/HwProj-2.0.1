using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace HwProj.PageObjects
{
    public static class WaitUntil
    {
        public static void WaitLocation(IWebDriver driver, string location, int time)
        {
            new WebDriverWait(driver, TimeSpan.FromSeconds(time))
                .Until(ExpectedConditions.UrlToBe(location));
        }

        public static void WaitElement(IWebDriver driver, By element, int time)
        {
            new WebDriverWait(driver, TimeSpan.FromSeconds(time))
                .Until(ExpectedConditions.ElementIsVisible(element));
        }
    }
}
