//encoding windows 1251 !!!
function Debug 
	(	ParOut, //�������� ������, 0 - � ��������� ����, 1 - � ��������� ����
		path, //����� ������ �����
		value //��������� ��������
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
		if (fso.FileExists(path + "debug.txt")) //�������� ������������� ����� debug.txt
	{
		//���������� � ������ ����� ��� ���� ������
		debugFile = fso.GetFile (path + "debug.txt");
		oldlog = debugFile.OpenAsTextStream(1);
		log = oldlog.ReadAll();
		oldlog.Close();
	}
		debugFile = fso.CreateTextFile(path + "debug.txt", true);
		date = new Date();
		//������ ����� ��� ���� ������ � ������
		debugFile.WriteLine(log + (date + ": " + "\n" + value));
		debugFile.Close();
	}
}