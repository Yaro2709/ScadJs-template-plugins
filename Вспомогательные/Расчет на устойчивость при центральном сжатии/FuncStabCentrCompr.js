//encoding windows 1251 !!!
//Функция расчета на устойчивость при центральном сжатии
function FuncStabCentrCompr
	(	
		NormDoc, //Код нормативного документа 
		//СП 16.13330.2017 с изменением 3 - "SP16.13330.2017i3"
		N, //Сжимающая нормальная сила
		A, //Площадь сечения
		Ry, //Расчетное сопротивление
		gc, //Коэффициент условий работы
		gn, //Коэффициент надежности по ответственности
		lambda, //Гибкость стержня
		TypeForm //Обозначение формы сечения
	)
{	
	N = Math.abs(N);
	var E = 206000000000; //Модуль упругости по табл. Б1 СП 16.13330.2017 в Н/м2
	var lambdaCond = lambda*Math.sqrt(Ry/E);
	//Расчет по СП 16.13330.2017 с изм. 3
	if (NormDoc == "SP16.13330.2017i3")
	{
		//Коээфициенты по табл. 7
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
		var delta = 9.87*(1 - alfa + beta*lambdaCond)+lambdaCond*lambdaCond; //Формула (8)
		var fi = 0.5*(delta - Math.sqrt(delta*delta - 39.48*lambdaCond*lambdaCond))/(lambdaCond*lambdaCond); //Формула (9)
		var LimitFi = 7.6/(lambdaCond*lambdaCond);
		if (TypeForm == "a")
			{
				if (lambdaCond > 3.8)
				{
					fi = LimitFi;
					var limitCond = "Условная гибкость > 3.8, fi=7.6/lambdaCond^2=" + fi.toFixed(3);
				}
				else
				{
					limitCond = "Условная гибкость <=3.8, ограничение fi=7.6/lambdaCond^2 не применяется";
					if (lambdaCond < 0.6)
					{
						fi = 1;
						limitCond = "Условная гибкость < 0.6, fi=" + fi.toFixed(3);
					}
					else
					{
						limitCond = "Условная гибкость >= 0.6 и <=3.8, ограничения на fi не применяются";
					}
				}
			}
			if (TypeForm == "b")
			{
				if (lambdaCond > 4.4)
				{
					fi = LimitFi;
					limitCond = "Условная гибкость > 4.4, fi=7.6/lambdaCond^2=" + fi.toFixed(3);
				}
				else
				{
					limitCond = "Условная гибкость <=4.4, ограничение fi=7.6/lambdaCond^2 не применяется";
					if (lambdaCond < 0.6)
					{
						fi = 1;
						limitCond = "Условная гибкость < 0.6, fi=" + fi.toFixed(3);
					}
					else
					{
						limitCond = "Условная гибкость >= 0.6 и <=4.4, ограничения на fi не применяются";
					}
				}
			}
			if (TypeForm === "c")
			{
				if (lambdaCond > 5.8)
				{
					fi = LimitFi;
					limitCond = "Условная гибкость > 5.8, fi=7.6/lambdaCond^2=" + fi.toFixed(3);
				}
				else
				{
					limitCond = "Условная гибкость <=5.8, ограничение fi=7.6/lambdaCond^2 не применяется";
				}
		}
		if (fi > 1) {fi = 1;}
		var Res =
		{ 
			N: (N/1000).toFixed(2), //кН
			A: (A*10000).toFixed(2), //см2
			Ry: (Ry/10000000), //кН/см2,
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
			koef: (N*gn/(fi*A*Ry*gc)).toFixed(3) //Формула (7)
		}
	}
	return Res;
}