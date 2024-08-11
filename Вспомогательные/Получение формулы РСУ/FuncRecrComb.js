//encoding windows 1251 !!!
//Функция получения формулы РСУ
function FuncRecrComb
(
	RSUstr //объект, возвращаемый методом Result.GetRsuStr (NumElem, NumStr, RsuStr)
)
{
	var QuantityNumLoad = RSUstr.QuantityNumLoad;
	var ListCoef = RSUstr.ListCoef.toArray();
	var ListNumLoad = RSUstr.ListNumLoad.toArray();
	var FormulaRSU = "";

	for (CountNumLoad = 0; CountNumLoad < QuantityNumLoad; CountNumLoad++)
	{	
		if (FormulaRSU == "")
		{
			FormulaRSU = ListCoef[CountNumLoad].toFixed(3) + "*L" + ListNumLoad[CountNumLoad];
			if (ListCoef[CountNumLoad] == 1)
			{
				FormulaRSU = "L" + ListNumLoad[CountNumLoad];
			}
		}
		else
		{	
			if (ListCoef[CountNumLoad] == 1)
			{
				FormulaRSU = FormulaRSU + "+" + "L" + ListNumLoad[CountNumLoad];
			}
			else
			{
				FormulaRSU = FormulaRSU + "+" + ListCoef[CountNumLoad].toFixed(3) + "*L" + ListNumLoad[CountNumLoad];
			}
		}
	}
	return FormulaRSU;
}