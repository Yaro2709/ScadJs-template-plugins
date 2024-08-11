//encoding windows 1251 !!!
//� ����� ����������� ���  ��� ������ �������. ��� ������������� ���������� ��� ����������

/**
 * ������� ������������ ������� �������� ������. ��������� �� �����������
 * @param {*} editor
 * @param {number} x ���������� �� �.
 * @param {number} y ���������� �� Y.
 * @param {number} z ���������� �� Z.
 * @param {number} lenZ ������ �������.
 * @param {[number]} lengtSliceArr ������ ����������, �� ���������� ����, �� ������� ������� �������. ������ ������ ��������� ��������
 * ���������� ������� �������. ������ - ����� ����� lenZ = 10� ������� �� 2 ������ ����� lengtSliceArr = [5]
 */
function ColumnSliceSCADxyz(editor, x, y, z, lenZ, lengtSliceArr) {
    this.elementInfo = {
        id: "c_6",
        connect: 0
    };

    var elemNumberArr = []; //������ ������� ���������
    var nodeNumberArr = []; //������ �������� �����
    var centerNodeObjArr = []; //������ ����������� �������� �����


    var columnLength = parseFloat(lenZ);
    var _lengtSliceArr = lengtSliceArr;
    var nQ = 0; //���������� �����
    var eQ = 1; //���-�� ���������
    var baseElemNum = 0; // ����� ������� ��������
    var eI = 0; // ����� ������� ��������
    var countNod = 1; //������� �����

    var baseNodeNum = 0;
    var endNodeNum = 0;

    var correctLenArr; //���������� ������ � ������� �������� ����� ���� null

    var curNode = {};
    var curElem = {
        TypeElem: 5,
        ListNode: [0, 0]
    }; //�������� ������� - ��� �������� 5, ������ �����[start, end]

    /**
     * �������� �������
     */
    this.CreateColumn = function () {
        correctLenArr = GetCorrectLenArr();
        if (correctLenArr == null || correctLenArr.length == 0) {
            nQ = 2; //���������� �����
            baseNodeNum = editor.NodeAdd(nQ); //����� ������� ����
            endNodeNum = countNod + baseNodeNum;

            eQ = 1; //���-�� ���������
            baseElemNum = editor.ElemAdd(eQ); // ����� ������� ��������
            eI = baseElemNum; // ����� ������� ��������
            elemNumberArr.push(eI);

            //#region �������� ���������, �����

            curNode = {
                x: x,
                y: y,
                z: z
            }; //������ � ������������, ��� �����
            //��������� ����
            (editor.NodeUpdate(baseNodeNum, curNode));
            AddNode(baseNodeNum, curNode, nodeNumberArr);

            //������� ����
            curNode.z = columnLength;
            (editor.NodeUpdate(endNodeNum, curNode));
            AddNode(endNodeNum, curNode, nodeNumberArr);

            curElem.ListNode[0] = baseNodeNum; //������ ����� � ������ ��� �������� ����
            curElem.ListNode[1] = endNodeNum; //������ ����� � ������ ��� �������� ����

            //�������� ��������
            (editor.ElemUpdate(eI, curElem));

            //#endregion
        } else {
            nQ = correctLenArr.length + 2;
            baseNodeNum = editor.NodeAdd(nQ); //����� ������� ����

            eQ = correctLenArr.length + 1; //���-�� ���������
            baseElemNum = editor.ElemAdd(eQ); // ����� ������� ��������
            eI = baseElemNum; // ����� ������� ��������

            //#region �������� ���������, �����
            var hieghtZ = 0;
            //����
            curNode = {
                x: x,
                y: y,
                z: z
            }; //������ � ������������, ��� �����
            (editor.NodeUpdate(baseNodeNum, curNode));
            AddNode(baseNodeNum, curNode, nodeNumberArr);

            curElem.ListNode[0] = baseNodeNum;
            //����������� ����
            var j = 1;
            for (var i = 0; i < correctLenArr.length; i++) {
                hieghtZ += correctLenArr[i];

                //����
                curNode = {
                    x: x,
                    y: y,
                    z: z + hieghtZ
                }; //������ � ������������, ��� �����
                (editor.NodeUpdate(baseNodeNum + j, curNode));
                AddNode(baseNodeNum + j, curNode, nodeNumberArr);
                AddNode(baseNodeNum + j, curNode, centerNodeObjArr);

                //�������� ��������
                curElem.ListNode[1] = baseNodeNum + j; //������ ����� � ������ ��� �������� ����
                (editor.ElemUpdate(eI + i, curElem));
                elemNumberArr.push(eI + i); //������ �������
                curElem.ListNode[0] = baseNodeNum + j;
                j++;
            }

            //���� �����������
            curNode = {
                x: x,
                y: y,
                z: z + columnLength
            }; //������ � ������������, ��� �����
            (editor.NodeUpdate(baseNodeNum + nQ - 1, curNode));
            AddNode(baseNodeNum + nQ - 1, curNode, nodeNumberArr);

            //�������� ��������
            curElem.ListNode[1] = baseNodeNum + nQ - 1;
            (editor.ElemUpdate(eI + eQ - 1, curElem));
            elemNumberArr.push(eI + eQ - 1); //������ �������
            //#endregion
        }
    
    };


    /**
     * @returns {[object]} ���������� ������ ���� ����� � ���� ��������
     */
    this.GetAllNodes = function () {
        return nodeNumberArr;
    };

    /**
     * @returns ���������� ����������� ���� �������. ���� ��� �� ������� ���������� null
     */
    this.GetCenterNodes = function () {
        return centerNodeObjArr;
    };

    /**
     * ���������� ������ ���������� ����
     * @returns {object}  ������ ����
     */
    this.GetLastObjNode = function () {
        return nodeNumberArr[nodeNumberArr.length - 1];
    };

    /**
     * ���������� ������ ������� ����
     * @returns {object} ������ ������� ����
     */
    this.GetStartObjNode = function () {
        return nodeNumberArr[0];
    };


    /**
     *
     * @returns {[number]}  ���������� ������ ������� ���������
     */
    this.GetAllNumbersElements = function () {
        return elemNumberArr;
    };


    /**
     * ���������� ����� �������
     */
    this.GetColumnLength = function () {
        return columnLength;
    };

    /**
     * ���������� ������ �����
     */
    this.GetSliceArr = function () {
        return _lengtSliceArr;
    };

    /**
     * ������ ����� �������.
     */
    this.SetColumnLength = function (length) {
        columnLength = length;
    };

    /**
     * ������ ����� ������ ������
     * @param {[number]} newArr ����� ������ ������
     */
    this.SetSliceArr = function (newArr) {
        _lengtSliceArr = newArr;
    };
    /**
     * ������������ ���������� ���������� ���� � ��������� ����
     * @returns {object}  ������ ����
     */
    this.GetLastNodeCalculate = function () {
        var lastNodeObj = {
            x: x,
            y: y,
            z: lenZ
        };
        return lastNodeObj;
    };
    /**
     * ������������ ����� �� �������� ������� ��� ���������� ������ ����� �� ����� �������
     * @returns  �������� �������� �������
     */
    function GetCorrectLenArr() {
        var arrCorrect = [];
        var checkLenght = 0;
        var minAddLength = 0.05;

        if (_lengtSliceArr == null) {
            return arrCorrect;
        }

        for (var i = 0; i < _lengtSliceArr.length; i++) {
            if (_lengtSliceArr[i] <= minAddLength) {
                continue;
            }
            checkLenght += _lengtSliceArr[i];
            if (lenZ - 0.05 <= checkLenght) {
                break;
            }
            arrCorrect.push(_lengtSliceArr[i]);
        }

        return arrCorrect;
    }
    /**
     * ��������� ������ ���� � ������
     * @param {number} numbNode ����� ����
     * @param {object} objNode ������ �� ���� {x:0,y:0,z:0};
     * @param {object} writeArr ������ ��� ��������
     */
    function AddNode(numbNode, objNode, writeArr) {
        //���� ��� ��������

        var node = {
            nodeNum: numbNode,
            x: objNode.x,
            y: objNode.y,
            z: objNode.z
        };
        writeArr.push(node);
    }
}
