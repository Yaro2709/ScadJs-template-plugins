//encoding windows 1251 !!!
//������� ��������� ������� � ����������� �������������� �������� ������ �� ������ �������� (��� ��������� ����� ������������ � ������)
function FuncSteelElemPar
	(	
		Model, //����������� ��������� SCAD++
		NumElem, //����� ��������
	)
{
	//��������� ������ ������ �������� �������������� ��������� ��� ��������� ������ ���������
	var NumSteelElem = FindNumSteelElem(Model, NumElem);
	//�������� ������� �� ���������� ��� ������ GetSteelElem
	var SteelElem = 
	{
		QuantityElem: null, 
		ListElem: [],
		SteelMark: null,
		IsGroup: null,
		bRatio: null, //������������� ��� ������ ������� ������� ��������� ���� � ������� �� 21.1.9.9 ������������
		Ry: null,
		m_GammaN: null, //����������� ���������� �� ��������������� (������ ���������� ���������)
		Koef_usl_rab: null, //����������� ������� ������
		Koef_RasLen_XoZ: null,
		Koef_RasLen_YoZ: null,
		CalcLength_X0Z: null,
		CalcLength_Y0Z: null,
		StepOutPlane: null, //������������� ��� ������� ��������� ���� ��� fi_b � ������� �� 21.1.9.9 ������������
		EffType_XoZ: null, //������������ � ������ 21.1.9.11, 0 - ����� Koef_RasLen_XoZ, 1 - ����� CalcLength_X0Z
		EffType_YoZ: null,
		StepOutPlane_type: null, //������������ � ������ 21.1.9.11 ��� ����������� ������� ������� ��������� ���� ��� fi_b, 0 - ����� StepOutPlane_ratio, 1 - ����� StepOutPlane_linear
		StepOutPlane_ratio: null,
		StepOutPlane_linear: null
	};
	Model.GetSteelElem(NumSteelElem, SteelElem);
	var LengthElem = 0;
	var Res = 
	{
		SteelMark: SteelElem.SteelMark,
		Ry: SteelElem.Ry,
		gn: SteelElem.m_GammaN, //����������� ���������� �� ��������������� (������ ���������� ���������)
		gc: SteelElem.Koef_usl_rab, //����������� ������� ������
		EstLXOZ: 0, //��������� ����� � ������ � ��������� XOZ
		EstLXOY: 0, //��������� ����� � ������ � ��������� XOY
		EstlFib: 0 //��� ����������� �� ��������� ������ (��������� ����� ��� fi_b)
	};
	//����������� ����� �������� � ���� ����������� �� ���������, ���� ����� ������ �������
	if (SteelElem.IsGroup == 1)
	{	
		//����� ��������
		LengthElem = FuncLengthElem(Model, NumElem);
	}
	//����������� ����� ��������������� �������� � ���� ����������� �� ���������, ���� ����� ������ �������������� ���������
	if (SteelElem.IsGroup == 0)
	{
		//����� ��������������� ��������
		//var ListElem = SteelElem.ListElem.toArray();		
		for (var CountListElem = 0; CountListElem < SteelElem.QuantityElem; CountListElem++)
		{
			LengthElem = LengthElem + FuncLengthElem(Model, NumElem);
		}
	}
	//��������� ����� � ��������� X1oZ1
	if (SteelElem.bRatio == true || SteelElem.EffType_XoZ == 0) //��������� ����� ��� ������������� �������������
	{
		//��������� ����� � ��������� X1oZ1
		Res.EstLXOZ = LengthElem * SteelElem.Koef_RasLen_XoZ;
	}
	if (SteelElem.bRatio == false || SteelElem.EffType_XoZ == 1) //��������� ����� ��� ������������� ��������� ����
	{
		//��������� ����� � ��������� X1oZ1
		Res.EstLXOZ = SteelElem.CalcLength_X0Z;
	}
	
	//��������� ����� � ��������� X1oY1
	if (SteelElem.bRatio == true || SteelElem.EffType_YoZ == 0) //��������� ����� ��� ������������� �������������
	{
		//��������� ����� � ��������� X1oY1
		Res.EstLXOY = LengthElem * SteelElem.Koef_RasLen_YoZ;
	}
	if (SteelElem.bRatio == false || SteelElem.EffType_YoZ == 1) //��������� ����� ��� ������������� ��������� ����
	{
		//��������� ����� � ��������� X1oY1
		Res.EstLXOY = SteelElem.CalcLength_Y0Z;
	}
	
	//��� ������������ ������� ����� �� ���������	
	if (SteelElem.StepOutPlane >= 0)
	{
		Res.EstlFib = SteelElem.StepOutPlane;
	}
	if (SteelElem.StepOutPlane_type == 1) //��������� ����� ������ � ���� �����
	{
		Res.EstlFib = SteelElem.StepOutPlane_linear;
	}
	if (SteelElem.StepOutPlane_type == 0) //��������� ����� ������ �������������
	{
		Res.EstlFib = LengthElem *  SteelElem.StepOutPlane_ratio;
	}		
	if (Res.EstlFib == 0)
	{
		Res.EstlFib = LengthElem;
	}
	return Res;
}
//������� ������ ������ �������� �������������� ���������
function FindNumSteelElem(Model, NumElem)
{
	//�������� ������� �� ���������� ��� ������ GetSteelElem
	var SteelElem = {QuantityElem: null, ListElem: null};
	var QuantitySteelElem = Model.GetQuantitySteelElem();
	for (var CountSteelElem = 0; CountSteelElem < QuantitySteelElem; CountSteelElem++)
	{
		var NumSteelElem = CountSteelElem + 1;
		//��������� ������� ���������
		Model.GetSteelElem(NumSteelElem, SteelElem);
		var QuantityElem = SteelElem.QuantityElem;
		var ListElem = SteelElem.ListElem.toArray();
		//�������� ������� ������ �������� � �������
		for (var CountListElem = 0; CountListElem < QuantityElem; CountListElem++)
		{
			if (NumElem == ListElem[CountListElem])
			{
				return NumSteelElem;
			}
		}
	}
}
//������� ����������� ����� ����������� ��������
function FuncLengthElem(Model, NumElem)
{
	//�������� ������� �� ���������� ��������� ��� ������ GetElem
	var Elem = {ListNode: null};
	//�������� ������� �� ���������� ����� ��� ������ GetNode
	var Node = {x: null, y: null, z: null};
	//��������� ������� ��������
	Model.GetElem(NumElem, Elem);
	//��������� ������� ����� ����������� �������� ������ VBArray
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