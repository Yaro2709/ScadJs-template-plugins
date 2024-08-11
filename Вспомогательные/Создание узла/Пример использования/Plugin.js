function bindObj(thisObj, func) {
    return function () {
        return func.apply(thisObj, arguments);
    };
}

var global_obj = {
    explorer: null,
    excel: null
};

function Plugin_Clean() {
    if (global_obj.explorer) {
        global_obj.explorer.Quit();
        global_obj.explorer = null;
    }

    if (global_obj.excel) {
        global_obj.excel.DisplayAlerts = false;
        global_obj.excel.Quit();
        global_obj.excel = null;
    }
}

function Plugin_Cancel(engine) {
    Plugin_Clean();

    if (engine) {
        engine.Cancel();
    }
}

// function Plugin_ActivateUI(engine)
// {

// }

function Plugin_Execute(engine) {
    try {
        var model = engine.GetModel();
        var editor = engine.GetEditor();

        //�������� �����
        for (var i = 0; i < 10; i++) {
            
            var node = CreateNode(editor, 0+i, 0, 0+i);
        }

    } catch (e) {
        engine.Cancel(e);
    }
}

//===============================================================================
//#region SCAD Functions

/**
	 * ������� ���� � ��������� �����������
	 * @param {*} editor �������� SCAD
	 * @param {number} x ���������� �
	 * @param {number} y ���������� �
	 * @param {number} z ���������� Z
	 * @returns  ������ ���� - 
			{nodeNum:baseNodeNum,
			x:curNode.x,
			y:curNode.y,
			z:curNode.z}
	 */
function CreateNode(editor, x, y, z) {
    var nQ = 1;
    var baseNodeNum = editor.NodeAdd(nQ); //����� ������� ����
    var curNode = { x: x, y: y, z: z };
    editor.NodeUpdate(baseNodeNum, curNode); //�������� ���� � �����
    //������ ����
    var nodeObj = {
        nodeNum: baseNodeNum,
        x: curNode.x,
        y: curNode.y,
        z: curNode.z
    };

    return nodeObj;
}



//#endregion
