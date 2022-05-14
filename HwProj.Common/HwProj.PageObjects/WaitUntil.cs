using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using SeleniumExtras.WaitHelpers;

namespace HwProj.PageObjects
{
    public static class WaitUntil
    {
        public static void WaitElement(IWebDriver driver, By element, int time)
        {
            new WebDriverWait(driver, TimeSpan.FromSeconds(time))
                .Until(ExpectedConditions.ElementIsVisible(element));
        }
    }
}
