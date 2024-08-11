//encoding windows 1251 !!!
//������� ����������� ����� ����������� ��������
function FuncLengthElem
	(	Model, //����������� ��������� SCAD++
		NumElem //����� ��������
	)
{
	//�������� ������� �� ���������� ��������� ��� ������ GetElem
	var Elem = {ListNode: null};
	//�������� ������� �� ���������� ����� ��� ������ GetNode
	var Node = {x: null, y: null, z: null};
	//��������� ������� ��������
	Model.GetElem(NumElem, Elem);
	//��������� ������� ����� ����������� �������� ������� VBArray
	var Node1 = Elem.ListNode.getItem(0);
	var Node2 = Elem.ListNode.getItem(1);
	//��������� ��������� 1 ����
	Model.GetNode (Node1, Node);
	var Node1X = Node.x;
	var Node1Y = Node.y;
	var Node1Z = Node.z;
	//��������� ��������� 2 ����
	Model.GetNode (Node2, Node);
	var Node2X = Node.x;
	var Node2Y = Node.y;
	var Node2Z = Node.z;
	//����� ��������
	return Math.sqrt(
						(Node2X-Node1X)*(Node2X-Node1X) +
						(Node2Y-Node1Y)*(Node2Y-Node1Y) +
						(Node2Z-Node1Z)*(Node2Z-Node1Z)
					);
}