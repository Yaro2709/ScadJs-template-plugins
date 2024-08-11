//encoding windows 1251 !!!
//������� ����������� �������������� ������������� ���������������� �������� �� ��������������� S3 (�������������� ������� � ������� �������), S41 (������� ������� � ����������� �������), S42 (������� ������� � ������� �������)
function FuncGeomCharParamI 
(
	Description //������ �������� ���� ��������� Rigid.Description ������� Rigid ������ GetRigid ������������ ���������� Model
)
{
	var ArrDescription = Description.split(" ");
	var RigidID = ArrDescription[0];
	if (RigidID == "S3" || RigidID == "S41" || RigidID == "S42") //������ ��� �������������� �������� �������
	{
		if (RigidID == "S3")
		{
			var E = ArrDescription[1] //������ ���������
			var tw = ArrDescription[2]; //������� ������
			var bf2 = ArrDescription[4]; //������ ������ �����
			var tf2 = ArrDescription[5]; //������� ������ �����
			var bf1 = ArrDescription[6]; //������ ������� �����
			var tf1 = ArrDescription[7]; //������� ������� �����
			var NU = ArrDescription[9]; //����������� ��������
			var RO = ArrDescription[11]; //���������
			var hw = ArrDescription[3] - tf1 - tf2; //������ ������						
		}
		if (RigidID == "S41")
		{
			E = ArrDescription[1] //������ ���������
			bf1 = ArrDescription[2]; //������ ������� �����
			tf1 = ArrDescription[3]; //������� ������� �����
			bf2 = bf1; //������ ������ �����
			tf2 = tf1; //������� ������ �����
			hw = ArrDescription[4]; //������ ������
			tw = ArrDescription[5]; //������� ������
			NU = ArrDescription[7]; //����������� ��������
			RO = ArrDescription[9]; //���������	
		}
		if (RigidID == "S42")
		{
			E = ArrDescription[1] //������ ���������
			bf1 = ArrDescription[2]; //������ ������� �����
			tf1 = ArrDescription[3]; //������� ������� �����
			hw = ArrDescription[4]; //������ ������
			tw = ArrDescription[5]; //������� ������
			bf2 = ArrDescription[6]; //������ ������ �����
			tf2 = ArrDescription[7]; //������� ������ �����
			NU = ArrDescription[9]; //����������� ��������
			RO = ArrDescription[11]; //���������
		}
		//�������������� ����� � �����
		bf1 = parseFloat(bf1);
		tf1 = parseFloat(tf1);
		bf2 = parseFloat(bf2);
		tf2 = parseFloat(tf2);
		tw = parseFloat(tw);
		hw = parseFloat(hw);
		E = parseFloat(E);
		NU = parseFloat(NU);
		RO = parseFloat(RO);
		//������� � ���������� �� �.�. �� ������ �����
		var Af1 = bf1 * tf1;
		var zf1 = tf2 + hw + tf1/2;
		var Af2 = bf2 * tf2;
		var zf2 = tf2/2;
		var Aw = tw * hw;
		var zw = tf2 + hw/2;
		//������� �������
		var A = Af1 + Af2 + Aw
		//��������� ������ ������� ������������ ������ �����
		var zCf2 = (Af1 * zf1 + Af2 * zf2 + Aw * zw)/A
		//������� ������� ����� � ������ ������������ �� �.�. � ���������� �� �� �.�. �� �.�. �������
		var Iyf1 = bf1*tf1*tf1*tf1/12;
		zf1 = tf2 + hw + tf1/2 - zCf2;
		var Iyf2 = bf2*tf2*tf2*tf2/12;
		zf2 = zCf2 - tf2/2;
		var Iyw = tw*hw*hw*hw/12;
		zw = tf2 + hw/2 - zCf2;
		//������ ������� �������� ������������ ��� Y1
		var Iy = Iyf1 + zf1*zf1*Af1 + Iyf2 + zf2*zf2*Af2 + Iyw + zw*zw*Aw;
		var GeomCharParamI = 
		{
			ParamI: true, //������� ����, ��� ������� �������� ��������������� ���������
			RigidID: RigidID, //������������� ��������� 
			bf1: bf1, //������ ������� �����
			tf1: tf1, //������� ������� �����
			Af1: Af1, //������� ������ �����
			bf2: bf2, //������ ������ �����
			tf2: tf2, //������� ������ �����
			Af2: Af2, //������� ������ �����
			tw: tw, //������� ������
			hw: hw, //������ ������
			Aw: Aw, //������� ������
			zCf2: zCf2, //���������� �� ������ ������� �� ������ �����
			zCf1: tf1 + hw + tf2 - zCf2, //���������� �� ������ ������� �� ������� �����
			E: E, //������ ���������, �������� � ���������
			A: A, //������� �������
			Iy: Iy, //������ ������� ������������ ��� Y1
			NU: NU, //����������� ��������
			RO: RO
		};
	}
	else
	{
		GeomCharParamI = 
		{
			ParamI: false, //������� ����, ��� ������� �� �������� ��������������� ��� ������� ���������
			RigidID: RigidID, //������������� ���������
			bf1: null, //������ ������� �����
			tf1: null, //������� ������� �����
			bf2: null, //������ ������ �����
			tf2: null, //������� ������ �����
			tw: null, //������� ������
			hw: null, //������ ������
			zCf2: null, //���������� �� ������ ������� �� ������ �����
			zCf1: null, //���������� �� ������ ������� �� ������� �����
			E: null, //������ ���������, �������� � ���������
			A: null, //������� �������
			Iy: null, //������ ������� ������������ ��� Y1
			NU: null, //����������� ��������
			RO: null
		};
	}
	return GeomCharParamI
}