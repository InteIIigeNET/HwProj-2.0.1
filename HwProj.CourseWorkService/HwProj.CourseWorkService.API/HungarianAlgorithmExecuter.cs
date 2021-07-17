using System.Linq;

namespace HwProj.CourseWorkService.API
{
	public class HungarianAlgorithmExecuter
	{
		private const int Inf = 1000000;

		private readonly int[,] _matrix;

		//p -- паросочетание
		private readonly int[] _p;

		//u и v -- потенциалы
		private readonly int[] _u;

		private readonly int[] _v;

		//way -- вспомогательный массив для хранения минимумов, для более быстрой реализации
		private readonly int[] _way;

		public HungarianAlgorithmExecuter(int[,] matrix)
		{
			RowCount = matrix.GetLength(0);
			ColumnCount = matrix.GetLength(1);
			_matrix = matrix;
			_u = new int[RowCount + 1];
			_v = new int[ColumnCount + 1];
			_p = new int[ColumnCount + 1];
			_way = new int[ColumnCount + 1];
		}

		private int RowCount { get; }
		private int ColumnCount { get; }

		public int[] GetAnswer()
		{
			for (var i = 1; i <= RowCount; i++)
			{
				_p[0] = i;
				var j0 = 0;
				var minv = InitArray(ColumnCount + 1, Inf);
				var used = InitArray(ColumnCount + 1, false);
				do
				{
					used[j0] = true;
					int i0 = _p[j0], delta = Inf, j1 = 0;
					for (var j = 1; j <= ColumnCount; j++)
					{
						if (used[j]) continue;
						var cur = _matrix[i0 - 1, j - 1] - _u[i0] - _v[j];
						if (cur < minv[j])
						{
							minv[j] = cur;
							_way[j] = j0;
						}

						if (minv[j] < delta)
						{
							delta = minv[j];
							j1 = j;
						}
					}

					for (var j = 0; j <= ColumnCount; j++)
						if (used[j])
						{
							_u[_p[j]] += delta;
							_v[j] -= delta;
						}
						else
						{
							minv[j] -= delta;
						}

					j0 = j1;
				} while (_p[j0] != 0);

				do
				{
					var j1 = _way[j0];
					_p[j0] = _p[j1];
					j0 = j1;
				} while (j0 != 0);
			}

			var ans = new int[RowCount + 1];
			for (var j = 1; j <= ColumnCount; ++j)
				ans[_p[j]] = j - 1;

			return ans.Skip(1).ToArray();
		}

		private T[] InitArray<T>(int length, T value)
		{
			var arr = new T[length];
			for (var i = 0; i < arr.Length; i++) arr[i] = value;

			return arr;
		}
	}
}