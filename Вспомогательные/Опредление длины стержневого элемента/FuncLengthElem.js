//encoding windows 1251 !!!
//Функция определения длины стержневого элемента
function FuncLengthElem
	(	Model, //Программный интерфейс SCAD++
		NumElem //Номер элемента
	)
{
	//Создание объекта со свойствами элементов для метода GetElem
	var Elem = {ListNode: null};
	//Создание объекта со свойствами узлов для метода GetNode
	var Node = {x: null, y: null, z: null};
	//Получение свойств элемента
	Model.GetElem(NumElem, Elem);
	//Получение номеров узлов выделенного элемента методом VBArray
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