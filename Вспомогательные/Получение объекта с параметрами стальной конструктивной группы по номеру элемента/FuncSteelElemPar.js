//encoding windows 1251 !!!
//Функция получения объекта с параметрами конструктивной стальной группы по номеру элемента (все расчетные длины возвращаются в метрах)
function FuncSteelElemPar
	(	
		Model, //Программный интерфейс SCAD++
		NumElem, //Номер элемента
	)
{
	//Получение номера группы стальных конструктивных элементов для заданного номера элементов
	var NumSteelElem = FindNumSteelElem(Model, NumElem);
	//Создание объекта со свойствами для метода GetSteelElem
	var SteelElem = 
	{
		QuantityElem: null, 
		ListElem: [],
		SteelMark: null,
		IsGroup: null,
		bRatio: null, //Использовался для выбора способа задания расчетных длин в версиях до 21.1.9.9 включетельно
		Ry: null,
		m_GammaN: null, //коэффициент надежности по ответственности (первое предельное состояние)
		Koef_usl_rab: null, //коэффициент условий работы
		Koef_RasLen_XoZ: null,
		Koef_RasLen_YoZ: null,
		CalcLength_X0Z: null,
		CalcLength_Y0Z: null,
		StepOutPlane: null, //Использовался для задания расчетных длин для fi_b в версиях до 21.1.9.9 включетельно
		EffType_XoZ: null, //Используется с версии 21.1.9.11, 0 - задан Koef_RasLen_XoZ, 1 - задан CalcLength_X0Z
		EffType_YoZ: null,
		StepOutPlane_type: null, //Используется с версии 21.1.9.11 для определения способа задания расчетных длин для fi_b, 0 - задан StepOutPlane_ratio, 1 - задан StepOutPlane_linear
		StepOutPlane_ratio: null,
		StepOutPlane_linear: null
	};
	Model.GetSteelElem(NumSteelElem, SteelElem);
	var LengthElem = 0;
	var Res = 
	{
		SteelMark: SteelElem.SteelMark,
		Ry: SteelElem.Ry,
		gn: SteelElem.m_GammaN, //коэффициент надежности по ответственности (первое предельное состояние)
		gc: SteelElem.Koef_usl_rab, //коэффициент условий работы
		EstLXOZ: 0, //Расчетная длина в метрах в плоскости XOZ
		EstLXOY: 0, //Расчетная длина в метрах в плоскости XOY
		EstlFib: 0 //Шаг закрепления из плоскости изгиба (расчетная длина для fi_b)
	};
	//Определение длины элемента и шага закрепления из плоскости, если сталь задана группой
	if (SteelElem.IsGroup == 1)
	{	
		//Длина элемента
		LengthElem = FuncLengthElem(Model, NumElem);
	}
	//Определение длины конструктивного элемента и шага закрепления из плоскости, если сталь задана конструктивным элементом
	if (SteelElem.IsGroup == 0)
	{
		//Длина конструктивного элемента
		//var ListElem = SteelElem.ListElem.toArray();		
		for (var CountListElem = 0; CountListElem < SteelElem.QuantityElem; CountListElem++)
		{
			LengthElem = LengthElem + FuncLengthElem(Model, NumElem);
		}
	}
	//Расчетная длина в плоскости X1oZ1
	if (SteelElem.bRatio == true || SteelElem.EffType_XoZ == 0) //Расчетная длина при использовании коэффициентов
	{
		//Расчетная длина в плоскости X1oZ1
		Res.EstLXOZ = LengthElem * SteelElem.Koef_RasLen_XoZ;
	}
	if (SteelElem.bRatio == false || SteelElem.EffType_XoZ == 1) //Расчетная длина при использовании расчетных длин
	{
		//Расчетная длина в плоскости X1oZ1
		Res.EstLXOZ = SteelElem.CalcLength_X0Z;
	}
	
	//Расчетная длина в плоскости X1oY1
	if (SteelElem.bRatio == true || SteelElem.EffType_YoZ == 0) //Расчетная длина при использовании коэффициентов
	{
		//Расчетная длина в плоскости X1oY1
		Res.EstLXOY = LengthElem * SteelElem.Koef_RasLen_YoZ;
	}
	if (SteelElem.bRatio == false || SteelElem.EffType_YoZ == 1) //Расчетная длина при использовании расчетных длин
	{
		//Расчетная длина в плоскости X1oY1
		Res.EstLXOY = SteelElem.CalcLength_Y0Z;
	}
	
	//Шаг раскрепления сжатого пояса из плоскости	
	if (SteelElem.StepOutPlane >= 0)
	{
		Res.EstlFib = SteelElem.StepOutPlane;
	}
	if (SteelElem.StepOutPlane_type == 1) //Расчетная длина задана в виде длины
	{
		Res.EstlFib = SteelElem.StepOutPlane_linear;
	}
	if (SteelElem.StepOutPlane_type == 0) //Расчетная длина задана коэффициентом
	{
		Res.EstlFib = LengthElem *  SteelElem.StepOutPlane_ratio;
	}		
	if (Res.EstlFib == 0)
	{
		Res.EstlFib = LengthElem;
	}
	return Res;
}
//Функция поиска группы стальных конструктивных элементов
function FindNumSteelElem(Model, NumElem)
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
				return NumSteelElem;
			}
		}
	}
}
//Функция определения длины стержневого элемента
function FuncLengthElem(Model, NumElem)
{
	//Создание объекта со свойствами элементов для метода GetElem
	var Elem = {ListNode: null};
	//Создание объекта со свойствами узлов для метода GetNode
	var Node = {x: null, y: null, z: null};
	//Получение свойств элемента
	Model.GetElem(NumElem, Elem);
	//Получение номеров узлов выделенного элемента модами VBArray
	var Node1 = Elem.ListNode.getItem(0);
	var Node2 = Elem.ListNode.getItem(1);
	//Получение координат 1 узла
	Model.GetNode (Node1, Node);
	var Node1X = Node.x;
	var Node1Y = Node.y;
	var Node1Z = Node.z;
	//Получение координат 2 узла
	Model.GetNode (Node2, Node);
	var Node2X = Node.x;
	var Node2Y = Node.y;
	var Node2Z = Node.z;
	//Длина элемента
	return Math.sqrt(
						(Node2X-Node1X)*(Node2X-Node1X) +
						(Node2Y-Node1Y)*(Node2Y-Node1Y) +
						(Node2Z-Node1Z)*(Node2Z-Node1Z)
					);
}