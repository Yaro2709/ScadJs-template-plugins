//encoding windows 1251 !!!
//������� ������ ������ �������� �������������� ���������
function FiindNumSteelElem
	(	Model, //����������� ��������� SCAD++
		NumElem //����� ��������
	)
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
				return NumSteelElem; //����� ������ ��������� ��������������� ��������
			}
		}

	}
}