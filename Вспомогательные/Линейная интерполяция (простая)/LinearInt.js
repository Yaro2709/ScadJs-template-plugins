//encoding windows 1251 !!!
//Функция линейной интерополяции
function LinearInt(x1, Fx1, x, x2, Fx2) 
{
	var Fx = Fx1 + (Fx2 - Fx1)*(x - x1)/(x2 - x1);
	return Fx;
}