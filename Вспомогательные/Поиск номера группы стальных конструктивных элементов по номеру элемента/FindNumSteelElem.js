//encoding windows 1251 !!!
//Функция поиска группы стальных конструктивных элементов
function FiindNumSteelElem
	(	Model, //Программный интерфейс SCAD++
		NumElem //Номер элемента
	)
{
	//Создание объекта со свойствами для метода GetSteelElem
	var SteelElem = {QuantityElem: null, ListElem: null};
	var QuantitySteelElem = Model.GetQuantitySteelElem();
	for (var CountSteelElem = 0; CountSteelElem < QuantitySteelElem; CountSteelElem++)
	{
		var NumSteelElem = CountSteelElem + 1;
		//Получение массива элементов
		Model.GetSteelElem(NumSteelElem, SteelElem);
		var QuantityElem = SteelElem.QuantityElem;
		var ListElem = SteelElem.ListElem.toArray();
		//Проверка наличия номера элемента в массиве
		for (var CountListElem = 0; CountListElem < QuantityElem; CountListElem++)
		{
			if (NumElem == ListElem[CountListElem])
			{
				return NumSteelElem; //Номер группы стального конструктивного элемента
			}
		}

	}
}