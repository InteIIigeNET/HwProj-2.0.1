using HwProj.CourseWorkService.API;
using NUnit.Framework;

namespace HwProj.CourseWorkService.Tests
{
	public class Tests
	{
		[SetUp]
		public void Setup()
		{
		}

		[Test]
		public void Test1()
		{
			// Arrange
			var expectedAns = new [] {3, 0, 2};
			var matrix = new[,]
			{
				{-2, 0, 2, -2},
				{-2, -1, -1, -1},
				{2, 2, -2, 0}
			};
			var executer = new HungarianAlgorithmExecuter(matrix);

			// Act
			var ans = executer.GetAnswer();

			// Assert
			Assert.AreEqual(expectedAns, ans);
		}
	}
}