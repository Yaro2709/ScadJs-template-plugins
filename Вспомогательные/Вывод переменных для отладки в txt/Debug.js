//encoding windows 1251 !!!
function Debug 
	(	ParOut, //Параметр вывода, 0 - в модальное окно, 1 - в текстовый файл
		path, //Папка вывода файла
		value //Выводимое значение
	)
{
	if (ParOut == 0)
	{
		var MsgBox = new ActiveXObject("Wscript.shell");
		MsgBox.Popup (value);
	}
	if (ParOut == 1)
	{
		var fso, oldlog, log, debugFile, date;
		log = "";
		fso = new ActiveXObject("Scripting.FileSystemObject");
		if (fso.FileExists(path + "debug.txt")) //Проверка существования файла debug.txt
	{
		//Сохранение в памяти всего что было раньше
		debugFile = fso.GetFile (path + "debug.txt");
		oldlog = debugFile.OpenAsTextStream(1);
		log = oldlog.ReadAll();
		oldlog.Close();
	}
		debugFile = fso.CreateTextFile(path + "debug.txt", true);
		date = new Date();
		//Запись всего что было раньше и нового
		debugFile.WriteLine(log + (date + ": " + "\n" + value));
		debugFile.Close();
	}
}