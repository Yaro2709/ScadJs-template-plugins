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
        var node_1 = CreateNode(editor, 0, 0, 0);
        var node_2 = CreateNode(editor, 6, 0, 0);
        var node_3 = CreateNode(editor, 0, 1, 0);
        var node_4 = CreateNode(editor, 6, 1, 2);

        //�������� ����� �1
        var beam_1 = new BeamSCAD(editor, node_1, node_2, 2, 1);
        beam_1.Create();

        //�������� ����� �2
        var beam_2 = new BeamLengthCenter(editor, node_3, node_4, 2.5, 2);
        beam_2.Create();

        //����� ���������� �� ������� �����
        var nodeArr = beam_1.GetAllNodes(); //��� ���� �����
        var elemNumbArr = beam_1.GetAllNumbersElemets(); //��� ������ ��������� �����

        var nodeArr_2 = beam_2.GetAllNodes(); //��� ���� �����
        var elemNumbArr_2 = beam_2.GetAllNumbersElemets(); //��� ������ ��������� �����
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

/**
 * �������� �����:
 			-� ���������� �� 2 ����� � ������� ���������� �� ���������� ���� �� ������������
			-c ���������� ��������
 * @param {*} editor - �������� �������� ��������
 * @param {object} startNode - ������ ������� ����
 * @param {object} endNode - ������ ���������� ����
 * @param {number} step - ���������� �� ���������� ���� �� ������������
 * @param {number} joint - ��������� �������� �� ����� ������: 0 ��� null - ������� ����������;
 * 															  1 - ������� �� Ux � Uy �� 2 ������
 * 															  2 - ������� �� Ux � Uy � ������
 * 														      3 - ������� �� Ux � Uy � �����
 */
function BeamLengthCenter(editor, startNode, endNode, step, joint) {
    this.elementInfo = {
        id: "b_3",
        connect: 11
    };
    var elemNumberArr = []; //������ ������� ���������
    var nodeNumberArr = []; //������ �������� �����
    var centerNodeObjArr = []; //������ ����������� �������� �����

    var minLenRegion = 0.01; //����������� ������

    this.joint = joint;
    //#region ��������

    if (joint > 3 || joint < 0) {
        this.joint = 1;
    }

    //#endregion

    //#region ��������
    //����������� ����� �������� �� ���� ����������� ����� ������
    var objLenCoor = LenghtRegion(startNode, endNode, step);
    var eQ = 1; //���-�� ���������
    if (
        step >= minLenRegion &&
        objLenCoor.lengthElement - minLenRegion >= step
    ) {
        eQ = 2; //���-�� ���������
    }

    var baseElemNum = editor.ElemAdd(eQ); // ���� ������ �������� � ���������, ����� ������� ��������
    var eI = baseElemNum; // ����� ������� ��������

    var curElem = { TypeElem: 5, ListNode: [0, 0] }; //�������� ������� - ��� �������� 5, ������ �����[start, end]
    var Joint = { Mask: 48, Place: 1 }; //������ ��� ������� ��������
    //#endregion

    //#region ����
    //���� ���������� ������� ������� �� ����������� ����� ����
    if (eQ == 1) {
        curElem.ListNode[0] = startNode.nodeNum;
        curElem.ListNode[1] = endNode.nodeNum;
        editor.ElemUpdate(eI, curElem); //�������� ��������

        elemNumberArr.push(eI);
        nodeNumberArr.push(startNode);
        nodeNumberArr.push(endNode);

        //#region ���������� �������� �� 2 ������
        if (this.joint == 1) {
            editor.JointSet(eI, 1, Joint);
            editor.JointSet(eI, 2, Joint);
        } else if (this.joint == 2) {
            editor.JointSet(eI, 1, Joint); //������ �������
        } else if (this.joint == 3) {
            editor.JointSet(eI, 2, Joint); //��������� �������
        }

        //#endregion
    } else {
        var nQ = 1; //���������� �����
        var midleNodeNum = editor.NodeAdd(nQ); //����� ������� ����
        var curNode = {
            x: startNode.x + objLenCoor.lenX,
            y: startNode.y + objLenCoor.lenY,
            z: startNode.z + objLenCoor.lenZ
        };
        curElem.ListNode[0] = startNode.nodeNum; //���������� 1 ���� ��� ��������, ��������� ����
        nodeNumberArr.push(startNode);

        for (var i = 0; i < nQ; i++) {
            editor.NodeUpdate(midleNodeNum + i, curNode); //�������� ������ ����
            curElem.ListNode[1] = midleNodeNum + i; //���������� 2 ���� ��� ��������
            editor.ElemUpdate(eI + i, curElem); //�������� ��������

            //���������� �������� ����������
            elemNumberArr.push(eI + i);

            //������ ��� ������ �����
            var nodeObj = {
                nodeNum: midleNodeNum + i,
                x: curNode.x,
                y: curNode.y,
                z: curNode.z
            };

            nodeNumberArr.push(nodeObj); //������ ���� � ������
            centerNodeObjArr.push(nodeObj); //������ ���� � ������

            curElem.ListNode[0] = midleNodeNum + i;
        }

        curElem.ListNode[1] = endNode.nodeNum;
        editor.ElemUpdate(eI + nQ, curElem);

        elemNumberArr.push(eI + nQ);
        nodeNumberArr.push(endNode);
        //#endregion

        //#region ���������� ��������
        //�� 2 ������
        if (this.joint == 1) {
            editor.JointSet(eI, 1, Joint); //������ �������
            editor.JointSet(eI + nQ, 2, Joint); //��������� �������
        }
        //������ � ������
        if (this.joint == 2) {
            editor.JointSet(eI, 1, Joint); //������ �������
        }
        //������ � �����
        if (this.joint == 3) {
            editor.JointSet(eI + nQ, 2, Joint); //��������� �������
        }
    }
    //#endregion

    /**
     * @returns {number} ���������� ����� ���������� ��������
     */
    this.GetLastElemNumber = function () {
        return elemNumberArr[elemNumberArr.length - 1];
    };

    /**
     * @returns {Array} ���������� ������ ���� ����� � ���� ��������
     */
    this.GetAllNodes = function () {
        return nodeNumberArr;
    };

    /**
     * @returns {Array} ���������� ������ ���� ������� ���������
     */
    this.GetAllNumbersElemets = function () {
        return elemNumberArr;
    };

    /**
     * @returns ���������� ����������� ���� �������. ���� ��� �� ������� ���������� null
     */
    this.GetCenterNodes = function () {
        if (centerNodeObjArr == null) {
            return null;
        }
        return centerNodeObjArr;
    };

    /**
                               * 
                               * @returns {object} ������ � ��������� ���� �� ���� ����������� {
                                      lenX,- �������� �� ��� �
                                      lenY, - �������� �� ��� Y
                                      lenZ, - �������� �� ��� Z
                                      lenghtReg, - ����� ��������� �������
                                      lengthElement - ����� ����� ��������}
                               */
    this.GetLengthRegion = function () {
        return objLenCoor;
    };

    /**
     * ������ �������� ������ ���� �������
     * @param {number} numbJoint - ����� ����������: 0 ��� null - ������� ����������;
     * 															  1 - ������� �� Ux � Uy �� 2 ������;
     * 															  2 - ������� �� Ux � Uy � ������;
     * 														      3 - ������� �� Ux � Uy � �����;
     */
    this.SetJoinNumber = function (numbJoint) {
        if (numbJoint == 1) {
            editor.JointSet(eI, 1, Joint);
            editor.JointSet(eI, 2, Joint);
        } else if (numbJoint == 2) {
            editor.JointSet(eI, 1, Joint); //������ �������
        } else if (numbJoint == 3) {
            editor.JointSet(eI, 2, Joint); //��������� �������
        }
    };
    /**
     * ��������� ����� �������, ����� �����, ����� �������� ��������� � ����������� �� ���������.
     * @param {object} endPoint - ������ ������� ����
     * @param {object} startPoint - ������ ���������� ����
     * @param {number} step - ���-�� ���������
     * @returns {object} ������ � ��������� ���� �� ���� �����������
     */
    function LenghtRegion(startPoint, endPoint, step) {
        var x = (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x);
        var y = (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y);
        var z = (endPoint.z - startPoint.z) * (endPoint.z - startPoint.z);

        var lenEl = parseFloat(Math.sqrt(x + y + z)); //����� ����� ��������
        var lenReg = parseFloat(lenEl - step);
        var fi = step / lenReg;

        var coordObj = {
            x: (startPoint.x + fi * endPoint.x) / (1 + fi),
            y: (startPoint.y + fi * endPoint.y) / (1 + fi),
            z: (startPoint.z + fi * endPoint.z) / (1 + fi)
        };
        var lenObj = {
            lenX: coordObj.x - startPoint.x,
            lenY: coordObj.y - startPoint.y,
            lenZ: coordObj.z - startPoint.z,
            lenghtReg: lenReg,
            lengthElement: lenEl
        };
        return lenObj;
    }

}

/**
 * �������� �����:
 			-� ������ ���������� �� �����
			-c ���������� ��������
 * @param {*} editor - SCAD ��������
 * @param {object} startNode - ������ ������� ����
 * @param {object} endNode - ������ ���������� ����
 * @param {number} step - ���-�� ���������
 * @param {number} joint - ��������� �������� �� ����� ������: 0 ��� null - ������� ����������;
 * 															  1 - ������� �� Ux � Uy �� 2 ������
 * 															  2 - ������� �� Ux � Uy � ������
 * 														      3 - ������� �� Ux � Uy � �����
 */
function BeamSCAD(editor, startNode, endNode, step, joint) {
    this.elementInfo = {
        id: "b_5",
        connect: 11,
        role: "any",
        incline: true,
        column: false
    };

    var elemNumberArr = []; //������ ������� ���������
    var nodeNumberArr = []; //������ �������� �����
    var centerNodeObjArr = []; //������ ����������� �������� �����
    _joint = joint;
    //#region ��������
    if (step <= 0) {
        step = 1;
    }

    if (_joint > 3 || _joint < 0) {
        _joint = 1;
    }

    //#endregion
    this.Create = function () {
        //#region ��������
        var eQ = step; //���-�� ���������
        var baseElemNum = editor.ElemAdd(eQ); // ���� ������ �������� � ���������, ����� ������� ��������
        var eI = baseElemNum; // ����� ������� ��������

        var curElem = { TypeElem: 5, ListNode: [0, 0] }; //�������� ������� - ��� �������� 5, ������ �����[start, end]
        var Joint = { Mask: 48, Place: 1 }; //������ ��� ������� ��������
        //#endregion

        //#region ����
        //���� ���������� ������� ������� �� ����������� ����� ����
        if (step > 1) {
            var nQ = step - 1; //���������� �����
            var midleNodeNum = editor.NodeAdd(nQ); //����� ������� ����

            //����������� ����� �������� �� ���� ����������� ����� ������
            var objLenCoor = LenghtRegion(startNode, endNode, step);

            var curNode = {
                x: startNode.x + objLenCoor.lenX,
                y: startNode.y + objLenCoor.lenY,
                z: startNode.z + objLenCoor.lenZ
            };
            //#region ��������
            curElem.ListNode[0] = startNode.nodeNum; //���������� 1 ���� ��� ��������, ��������� ����
            nodeNumberArr.push(startNode);

            for (var i = 0; i < nQ; i++) {
                editor.NodeUpdate(midleNodeNum + i, curNode); //�������� ������ ����
                curElem.ListNode[1] = midleNodeNum + i; //���������� 2 ���� ��� ��������
                editor.ElemUpdate(eI + i, curElem); //�������� ��������

                //���������� �������� ����������
                elemNumberArr.push(eI + i);

                //������ ��� ������ �����
                var nodeObj = {
                    nodeNum: midleNodeNum + i,
                    x: curNode.x,
                    y: curNode.y,
                    z: curNode.z
                };

                nodeNumberArr.push(nodeObj); //������ ���� � ������
                centerNodeObjArr.push(nodeObj); //������ ���� � ������

                curNode.x += objLenCoor.lenX;
                curNode.y += objLenCoor.lenY;
                curNode.z += objLenCoor.lenZ;

                curElem.ListNode[0] = midleNodeNum + i;
            }
            curElem.ListNode[1] = endNode.nodeNum;
            editor.ElemUpdate(eI + nQ, curElem);

            elemNumberArr.push(eI + nQ);
            nodeNumberArr.push(endNode);
            //#endregion

            //#region ���������� ��������
            //�� 2 ������
            if (_joint == 1) {
                editor.JointSet(eI, 1, Joint); //������ �������
                editor.JointSet(eI + nQ, 2, Joint); //��������� �������
            }
            //������ � ������
            if (_joint == 2) {
                editor.JointSet(eI, 1, Joint); //������ �������
            }
            //������ � �����
            if (_joint == 3) {
                editor.JointSet(eI + nQ, 2, Joint); //��������� �������
            }
            //#endregion
        } else {
            curElem.ListNode[0] = startNode.nodeNum;
            curElem.ListNode[1] = endNode.nodeNum;
            editor.ElemUpdate(eI, curElem); //�������� ��������

            elemNumberArr.push(eI);
            nodeNumberArr.push(startNode);
            nodeNumberArr.push(endNode);

            //#region ���������� �������� �� 2 ������
            if (_joint == 1) {
                editor.JointSet(eI, 1, Joint);
                editor.JointSet(eI, 2, Joint);
            } else if (_joint == 2) {
                editor.JointSet(eI, 1, Joint); //������ �������
            } else if (_joint == 3) {
                editor.JointSet(eI, 2, Joint); //��������� �������
            }

            //#endregion
        }
        //#endregion
    };

    /**
     * @returns {number} ���������� ����� ���������� ��������
     */
    this.GetLastElemNumber = function () {
        return elemNumberArr[elemNumberArr.length - 1];
    };

    /**
     * @returns {Array} ���������� ������ ���� ����� � ���� ��������
     */
    this.GetAllNodes = function () {
        return nodeNumberArr;
    };
    /**
     * @returns {[]} ���������� ������ ����� ��� ������������� ������
     */
    this.GetRightConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(nodeNumberArr[nodeNumberArr.length - 1]);
        return connectionNodesArr;
    };
    /**
     * @returns {[]} ���������� ������ ����� ��� ������������� �����
     */
    this.GetLeftConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(nodeNumberArr[0]);
        return connectionNodesArr;
    };
    /**
     * @returns {Array} ���������� ������ ���� ������� ���������
     */
    this.GetAllNumbersElemets = function () {
        return elemNumberArr;
    };

    /**
     * @returns ���������� ����������� ���� �������. ���� ��� �� ������� ���������� null
     */
    this.GetCenterNodes = function () {
        if (centerNodeObjArr == null) {
            return null;
        }
        return centerNodeObjArr;
    };

    /**
                 * 
                 * @returns {object} ������ � ��������� ���� �� ���� ����������� {
                         lenX,- �������� �� ��� �
                        lenY, - �������� �� ��� Y
                        lenZ, - �������� �� ��� Z
                        lenghtReg, - ����� ��������� �������
                        lengthElement - ����� ����� ��������}
                */
    this.GetLengthRegion = function () {
        return objLenCoor;
    };

    /**
     * ������ �������� ������ ���� �������
     * @param {number} numbJoint - ����� ����������: 0 ��� null - ������� ����������;
     * 															  1 - ������� �� Ux � Uy �� 2 ������;
     * 															  2 - ������� �� Ux � Uy � ������;
     * 														      3 - ������� �� Ux � Uy � �����;
     */
    this.SetJoinNumber = function (numbJoint) {
        if (numbJoint == 1) {
            editor.JointSet(eI, 1, Joint);
            editor.JointSet(eI, 2, Joint);
        } else if (numbJoint == 2) {
            editor.JointSet(eI, 1, Joint); //������ �������
        } else if (numbJoint == 3) {
            editor.JointSet(eI, 2, Joint); //��������� �������
        }
    };

    /**
     * ���������� ���������� ���� ������� �����
     */
    this.GetAngleBeam = function () {
        var numbAngelA = 0;
        var hight = startNode.z - endNode.z;
        if (hight != 0) {
            var math = new MathGeometry();
            var lengTopElem = math.LenghtRegion(startNode, endNode);

            var a = lengTopElem; //����� �������� ����� ���������
            var b = endNode.x - startNode.x;
            var c = hight;

            var cosA = (a * a + b * b - c * c) / (2 * a * b);
            var radA = Math.acos(cosA);
            numbAngelA = radA * (180 / Math.PI);
        }

        return numbAngelA;
    };
    /**
     * @returns {number} ���������� ������ ����� � �����
     */
    this.GetTrussHeightInPillar = function () {
        var height = 0;

        if (this.elementInfo.column) {
            height = hightStart;
        }
        return height;
    };

    /**
     * ��������� ����� �������, �����, ����� �������� ��������� � ����������� �� ���������.
     * @param {object} endPoint - ������ ������� ����
     * @param {object} startPoint - ������ ���������� ����
     * @param {number} step - ���-�� ���������
     * @returns {object} ������ � ��������� ���� �� ���� �����������
     */
    function LenghtRegion(startPoint, endPoint, step) {
        var x = (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x);
        var y = (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y);
        var z = (endPoint.z - startPoint.z) * (endPoint.z - startPoint.z);

        var lenEl = parseFloat(Math.sqrt(x + y + z)); //����� ����� ��������
        var lenReg = parseFloat(lenEl / step);
        var fi = lenReg / (lenEl - lenReg);

        var coordObj = {
            x: (startPoint.x + fi * endPoint.x) / (1 + fi),
            y: (startPoint.y + fi * endPoint.y) / (1 + fi),
            z: (startPoint.z + fi * endPoint.z) / (1 + fi)
        };
        var lenObj = {
            lenX: coordObj.x - startPoint.x,
            lenY: coordObj.y - startPoint.y,
            lenZ: coordObj.z - startPoint.z,
            lenghtReg: lenReg,
            lengthElement: lenEl
        };
        return lenObj;
    }

    function MathGeometry() {
        /**
         * ��������� ����
         * @param {object} point1 ������� 1 (����)
         * @param {object} point2 ������� 2 (����)
         * @param {object} calcPoint �������, ����� �� ��������� ����������� ���� (����)
         * @returns {number} ���� � ��������
         */
        this.AngelTriangle = function (point1, point2, calcPoint) {
            var a = this.LenghtRegion(point1, calcPoint);
            var b = this.LenghtRegion(point2, calcPoint);
            var c = this.LenghtRegion(point2, point1);

            var cosA = (a * a + b * b - c * c) / (2 * a * b);
            var radA = Math.acos(cosA);
            var numbAngelA = radA * (180 / Math.PI);

            return numbAngelA;
        };

        /**
         * ��������� ����� �������, �����, ����� �������� ��������� � ����������� �� ���������.
         * @param {object} endPoint - ������ ������� ����
         * @param {object} startPoint - ������ ���������� ����
         * @returns {number} ����� ����� �������
         */
        this.LenghtRegion = function (startPoint, endPoint) {
            var x = (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x);
            var y = (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y);
            var z = (endPoint.z - startPoint.z) * (endPoint.z - startPoint.z);

            var lenEl = parseFloat(Math.sqrt(x + y + z)); //����� ����� ��������

            return lenEl;
        };
    }
}

//#endregion
