//encoding windows 1251 !!!
//Функция определения геометрических характеристик параметрического двутавра по идентификаторам S3 (параметрически двутавр с разными полками), S41 (сварной двутавр с одинаковыми полками), S42 (сварной двутавр с разными полками)
function FuncGeomCharParamI 
(
	Description //полное описание типа жесткости Rigid.Description объекта Rigid метода GetRigid программного интерфейса Model
)
{
	var ArrDescription = Description.split(" ");
	var RigidID = ArrDescription[0];
	if (RigidID == "S3" || RigidID == "S41" || RigidID == "S42") //Только для параметрически заданных сечений
	{
		if (RigidID == "S3")
		{
			var E = ArrDescription[1] //Модуль упругости
			var tw = ArrDescription[2]; //Толщина стенки
			var bf2 = ArrDescription[4]; //Ширина нижней полки
			var tf2 = ArrDescription[5]; //Толщина нижней полки
			var bf1 = ArrDescription[6]; //Ширина верхней полки
			var tf1 = ArrDescription[7]; //Толщина верхней полки
			var NU = ArrDescription[9]; //Коэффициент Пуассона
			var RO = ArrDescription[11]; //Плотность
			var hw = ArrDescription[3] - tf1 - tf2; //Высота стенки						
		}
		if (RigidID == "S41")
		{
			E = ArrDescription[1] //Модуль упругости
			bf1 = ArrDescription[2]; //Ширина верхней полки
			tf1 = ArrDescription[3]; //Толщина верхней полки
			bf2 = bf1; //Ширина нижней полки
			tf2 = tf1; //Толщина нижней полки
			hw = ArrDescription[4]; //Высота стенки
			tw = ArrDescription[5]; //Толщина стенки
			NU = ArrDescription[7]; //Коэффициент Пуассона
			RO = ArrDescription[9]; //Плотность	
		}
		if (RigidID == "S42")
		{
			E = ArrDescription[1] //Модуль упругости
			bf1 = ArrDescription[2]; //Ширина верхней полки
			tf1 = ArrDescription[3]; //Толщина верхней полки
			hw = ArrDescription[4]; //Высота стенки
			tw = ArrDescription[5]; //Толщина стенки
			bf2 = ArrDescription[6]; //Ширина нижней полки
			tf2 = ArrDescription[7]; //Толщина нижней полки
			NU = ArrDescription[9]; //Коэффициент Пуассона
			RO = ArrDescription[11]; //Плотность
		}
		//Преобразование строк в числа
		bf1 = parseFloat(bf1);
		tf1 = parseFloat(tf1);
		bf2 = parseFloat(bf2);
		tf2 = parseFloat(tf2);
		tw = parseFloat(tw);
		hw = parseFloat(hw);
		E = parseFloat(E);
		NU = parseFloat(NU);
		RO = parseFloat(RO);
		//Площади и расстояния до ц.т. от нижней грани
		var Af1 = bf1 * tf1;
		var zf1 = tf2 + hw + tf1/2;
		var Af2 = bf2 * tf2;
		var zf2 = tf2/2;
		var Aw = tw * hw;
		var zw = tf2 + hw/2;
		//Площадь сечения
		var A = Af1 + Af2 + Aw
		//Положение центра тяжести относительно нижней грани
		var zCf2 = (Af1 * zf1 + Af2 * zf2 + Aw * zw)/A
		//Моменты инерции полок и стенки относительно их ц.т. и расстояния от их ц.т. до ц.т. сечения
		var Iyf1 = bf1*tf1*tf1*tf1/12;
		zf1 = tf2 + hw + tf1/2 - zCf2;
		var Iyf2 = bf2*tf2*tf2*tf2/12;
		zf2 = zCf2 - tf2/2;
		var Iyw = tw*hw*hw*hw/12;
		zw = tf2 + hw/2 - zCf2;
		//Момент инерции двутавра относительно оси Y1
		var Iy = Iyf1 + zf1*zf1*Af1 + Iyf2 + zf2*zf2*Af2 + Iyw + zw*zw*Aw;
		var GeomCharParamI = 
		{
			ParamI: true, //Признак того, что сечение является параметрическим двутавром
			RigidID: RigidID, //Идентификатор жесткости 
			bf1: bf1, //Ширина верхней полки
			tf1: tf1, //Толщина верхней полки
			Af1: Af1, //Площадь верхей полки
			bf2: bf2, //Ширина нижней полки
			tf2: tf2, //Толщина нижней полки
			Af2: Af2, //Площадь нижней полки
			tw: tw, //Толщина стенки
			hw: hw, //Высота стенки
			Aw: Aw, //Площадь стенки
			zCf2: zCf2, //Расстояние от центра тяжести до нижней грани
			zCf1: tf1 + hw + tf2 - zCf2, //Расстояние от центра тяжести до верхней грани
			E: E, //Модуль упругости, заданный в жесткости
			A: A, //Площадь сечения
			Iy: Iy, //Момент инерции относительно оси Y1
			NU: NU, //Коэффициент Пуассона
			RO: RO
		};
	}
	else
	{
		GeomCharParamI = 
		{
			ParamI: false, //Признак того, что сечение не является параметрическим или сварным двутавром
			RigidID: RigidID, //Идентификатор жесткости
			bf1: null, //Ширина верхней полки
			tf1: null, //Толщина верхней полки
			bf2: null, //Ширина нижней полки
			tf2: null, //Толщина нижней полки
			tw: null, //Толщина стенки
			hw: null, //Высота стенки
			zCf2: null, //Расстояние от центра тяжести до нижней грани
			zCf1: null, //Расстояние от центра тяжести до верхней грани
			E: null, //Модуль упругости, заданный в жесткости
			A: null, //Площадь сечения
			Iy: null, //Момент инерции относительно оси Y1
			NU: null, //Коэффициент Пуассона
			RO: null
		};
	}
	return GeomCharParamI
}