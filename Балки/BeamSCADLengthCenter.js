//encoding windows 1251 !!!
//� ����� ����������� ���  ��� ������ �������. ��� ������������� ���������� ��� ����������

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
