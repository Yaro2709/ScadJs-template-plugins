//encoding windows 1251 !!!
//������� ������� �� ������������ ��� ����������� ������
function FuncStabCentrCompr
	(	
		NormDoc, //��� ������������ ��������� 
		//�� 16.13330.2017 � ���������� 3 - "SP16.13330.2017i3"
		N, //��������� ���������� ����
		A, //������� �������
		Ry, //��������� �������������
		gc, //����������� ������� ������
		gn, //����������� ���������� �� ���������������
		lambda, //�������� �������
		TypeForm //����������� ����� �������
	)
{	
	N = Math.abs(N);
	var E = 206000000000; //������ ��������� �� ����. �1 �� 16.13330.2017 � �/�2
	var lambdaCond = lambda*Math.sqrt(Ry/E);
	//������ �� �� 16.13330.2017 � ���. 3
	if (NormDoc == "SP16.13330.2017i3")
	{
		//������������ �� ����. 7
		if (TypeForm == "a")
		{
			var alfa = 0.03;
			var beta = 0.06;
		}
		if (TypeForm == "b")
		{
			alfa = 0.04;
			beta = 0.09;
		}
		if (TypeForm == "c")
		{
			alfa = 0.04;
			beta = 0.14;
		}
		var delta = 9.87*(1 - alfa + beta*lambdaCond)+lambdaCond*lambdaCond; //������� (8)
		var fi = 0.5*(delta - Math.sqrt(delta*delta - 39.48*lambdaCond*lambdaCond))/(lambdaCond*lambdaCond); //������� (9)
		var LimitFi = 7.6/(lambdaCond*lambdaCond);
		if (TypeForm == "a")
			{
				if (lambdaCond > 3.8)
				{
					fi = LimitFi;
					var limitCond = "�������� �������� > 3.8, fi=7.6/lambdaCond^2=" + fi.toFixed(3);
				}
				else
				{
					limitCond = "�������� �������� <=3.8, ����������� fi=7.6/lambdaCond^2 �� �����������";
					if (lambdaCond < 0.6)
					{
						fi = 1;
						limitCond = "�������� �������� < 0.6, fi=" + fi.toFixed(3);
					}
					else
					{
						limitCond = "�������� �������� >= 0.6 � <=3.8, ����������� �� fi �� �����������";
					}
				}
			}
			if (TypeForm == "b")
			{
				if (lambdaCond > 4.4)
				{
					fi = LimitFi;
					limitCond = "�������� �������� > 4.4, fi=7.6/lambdaCond^2=" + fi.toFixed(3);
				}
				else
				{
					limitCond = "�������� �������� <=4.4, ����������� fi=7.6/lambdaCond^2 �� �����������";
					if (lambdaCond < 0.6)
					{
						fi = 1;
						limitCond = "�������� �������� < 0.6, fi=" + fi.toFixed(3);
					}
					else
					{
						limitCond = "�������� �������� >= 0.6 � <=4.4, ����������� �� fi �� �����������";
					}
				}
			}
			if (TypeForm === "c")
			{
				if (lambdaCond > 5.8)
				{
					fi = LimitFi;
					limitCond = "�������� �������� > 5.8, fi=7.6/lambdaCond^2=" + fi.toFixed(3);
				}
				else
				{
					limitCond = "�������� �������� <=5.8, ����������� fi=7.6/lambdaCond^2 �� �����������";
				}
		}
		if (fi > 1) {fi = 1;}
		var Res =
		{ 
			N: (N/1000).toFixed(2), //��
			A: (A*10000).toFixed(2), //��2
			Ry: (Ry/10000000), //��/��2,
			gc: gc,
			gn: gn,
			lambda: lambda.toFixed(3),
			lambdaCond: lambdaCond.toFixed(3),
			TypeForm: TypeForm,
			alfa: alfa.toFixed(3),
			beta: beta.toFixed(3),
			delta: delta.toFixed(3),
			limitCond: limitCond,
			fi: fi.toFixed(3),
			koef: (N*gn/(fi*A*Ry*gc)).toFixed(3) //������� (7)
		}
	}
	return Res;
}