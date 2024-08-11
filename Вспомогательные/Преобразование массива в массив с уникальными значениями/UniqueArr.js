//encoding windows 1251 !!!
//Функция выборки уникальных значений массива
function UniqueArr (Arr)
{
	Arr = Arr.sort();
	var ArrU = [];
	var j = 0;
	ArrU [0] = Arr [0];
	var QuantityArr = Arr.length; 
	for (i = 0; i < QuantityArr; i ++)
	{
		if (Arr[i] != ArrU[j])
		{
			j ++;
			ArrU[j] = Arr[i];
		}
	}
	return ArrU;
}