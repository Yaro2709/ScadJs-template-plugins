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

        //�������� �������
        var column = new ColumnTwoBranch(editor, 0, 0, 6, 1, 5, 0.2, 3,[0.5,1],true, 0.3, [2, 4], true);
        column.CreateColumn();

        //����� ���������� �� �������
        var nodeArr = column.GetLeftColumNodes(); //������ ���� ����� ����� �����
        var elemNumbArr = column.GetLeftColumElemNumbers(); //������ ���� ������� ��������� ����� �����

    } catch (e) {
        engine.Cancel(e);
    }
}

//===============================================================================
//#region SCAD Functions


/**
 * ������� ������������ �������
 * @param {*} editor
 * @param {number} coorX ���������� �.
 * @param {number} coorY ���������� �.
 * @param {number} hightTwoBeam ������ 2� ������ �� ����������� �����
 * @param {number} widthTwoBeam ������ 2� ������
 * @param {number} numberSliceTwoBeam ���-�� ��������� 2� ������
 * @param {number} offsetSupColumn ������ �� 1 ����� �� ������� �������
 * @param {number} hightSupColumn ������ ������� �������
 * @param {[number]} sliceSupColumn ������ ���� ��������� ������� ������� �� �����
 * @param {boolean} isReversCell ����������� �������: true - ������ � �����, false - ������ � ������
 * @param {number} offsetCell ������ ������� �� ������ �������
 * @param {[number]} numberRacksBeamArr ������ ������� � ����� �������� ������ ���� �������� ��
 * ���� ������: [2, 5] - 2 ����� ������ ������ ���� �������� ������ 5 �� ����������
 * @param {boolean} isOneFoundation ������� ����� ����� �� ���� ������ ��� �� 1: true - �� �����
 */
 function ColumnTwoBranch(
    editor,
    coorX,
    coorY,
    hightTwoBeam,
    widthTwoBeam,
    numberSliceTwoBeam,
    offsetSupColumn,
    hightSupColumn,
    sliceSupColumn,
    isReversCell,
    offsetCell,
    numberRacksBeamArr,
    isOneFoundation
) {
    this.elementInfo = {
        id: "c_4",
        connect: 1
    };
    var edit = editor;
    var X = coorX;
    var Y = coorY;
    var _hightTwoBeam = hightTwoBeam;
    var _hightSupColumn = hightSupColumn;
    var _sliceSupColumn = sliceSupColumn;

    /*****************************************/
    //#region �������
    var allElemNumbers = [];
    var allNodes = [];
    //��� �����
    var craneNodes = []; //����/���� ��� ����������� �����
    var leftColumnNodes = []; //������ ����� ����� �������
    var rightColumnNodes = []; //������ ����� ������ �������
    var startNodeSupColumn; //��������� ��� ������� �������
    allNodes.push(craneNodes, leftColumnNodes, rightColumnNodes);

    var leftColumnElemNumbers = []; //������ ������� ����� �������
    var rightColumnElemNumbers = []; //������ ������� ������ �������
    var hightSupBeamElemNumbers = []; //������ ������� ������� ����� ����� �������
    allElemNumbers.push(
        leftColumnElemNumbers,
        rightColumnElemNumbers,
        hightSupBeamElemNumbers
    );

    //������� �������
    var hieghtNodeForBeam; //���� ��� ����� ��� ����
    var supCenterNodes = []; //����������� ����
    allNodes.push(supCenterNodes);

    var supColumnNumbers = []; //������ ������� ��������� ������� �������

    //�����
    var cellNodes = []; ////������ ����� �������

    var cellElemNumbers = []; //������ ������� �������
    allElemNumbers.push(cellElemNumbers);

    //��������
    var racksElemNumbers = []; //������ ������� ��������
    allElemNumbers.push(racksElemNumbers);

    //Base
    var baseNodes = []; //������ ����� ���� �������

    var baseColumnElemNumbers = []; //������ ������� ���� �������
    allElemNumbers.push(baseColumnElemNumbers);

    //#endregion
    /*****************************************/
 
    /**
     * �������� ������������ �������
     */
    this.CreateColumn = function () {
        CreateTwoBreanch(
            _hightTwoBeam,
            widthTwoBeam,
            numberSliceTwoBeam,
            offsetSupColumn
        );

        CreateSupColumn(startNodeSupColumn, _hightSupColumn, _sliceSupColumn);

        CreateCell(isReversCell, offsetCell);

        CreateRacks(numberRacksBeamArr);

        //����������� ����������� ������� �������
        for (var i = 0; i < cellNodes.length; i++) {
            DOF("ColumnUnion", 63, cellNodes[i]);
        }

        CreateBase(isOneFoundation, widthTwoBeam);
    };

    //#region private method
    /**
     *
     * @param {number} hightColumn ������ ����������� �����
     * @param {number} width ������ ����������� �����
     * @param {number} split ���������� ���������
     * @param {number} offset ������ �� ��� �������
     */
    function CreateTwoBreanch(hightColumn, width, split, offset) {
        if (offset > width) {
            offset = width;
        } else if (offset < 0) {
            offset = 0;
        }

        var startPointLeft = CreateNode(edit, X - offset, Y, 0);
        var endPointLeft = CreateNode(edit, X - offset, Y, hightColumn);

        var startPointRight = CreateNode(edit, X - offset + width, Y, 0);
        var endPointRight = CreateNode(
            edit,
            X - offset + width,
            Y,
            hightColumn
        );

        var leftColumn = new Beam(edit, startPointLeft, endPointLeft, split, 0);
        [].push.apply(leftColumnNodes, leftColumn.GetAllNodes());
        craneNodes.push(leftColumnNodes[leftColumnNodes.length - 1]);
        [].push.apply(
            leftColumnElemNumbers,
            leftColumn.GetAllNumbersElements()
        );

        var rightColumn = new Beam(
            edit,
            startPointRight,
            endPointRight,
            split,
            0
        );
        [].push.apply(rightColumnNodes, rightColumn.GetAllNodes());
        craneNodes.push(rightColumnNodes[rightColumnNodes.length - 1]);
        [].push.apply(
            rightColumnElemNumbers,
            rightColumn.GetAllNumbersElements()
        );

        var supportBeam = new BeamLenghtCenter(
            edit,
            craneNodes[0],
            craneNodes[1],
            offset,
            0
        );
        [].push.apply(
            hightSupBeamElemNumbers,
            supportBeam.GetAllNumbersElements()
        );

        if (offset == width) {
            startNodeSupColumn = rightColumnNodes[rightColumnNodes.length - 1];
        } else if (offset == 0) {
            startNodeSupColumn = leftColumnNodes[leftColumnNodes.length - 1];
        } else {
            startNodeSupColumn = supportBeam.GetAllNodes()[1];
        }
    }

    /**
     * ������� ������� ������� ������������ �������
     * @param {number} startHight ��������� ������
     * @param {number} hight ������� ������ ������� �������
     * @param {[number]]} split ������ ��������� �������
     */
    function CreateSupColumn(startNode, hight, split) {
        var column = new ColumnSliceSCAD(edit, hight, startNode, split);
        column.CreateColumn();

        supColumnNumbers = column.GetAllNumbersElements();
        allElemNumbers.push(supColumnNumbers);
        hieghtNodeForBeam = column.GetLastObjNode();
        supCenterNodes = column.GetCenterNodes();
    }

    /**
     * ������� ������� �������
     * @param {boolean} isRevers ������ ����������
     * @param {number} offset ������ ����� �� ������ �������
     */
    function CreateCell(isRevers, offset) {
        var arr = [];

        if (isRevers) {
            cellNodes = AddCellNodesList(
                leftColumnNodes,
                rightColumnNodes,
                offset
            );
        } else {
            cellNodes = AddCellNodesList(
                rightColumnNodes,
                leftColumnNodes,
                offset
            );
        }

        for (var i = 1; i < cellNodes.length; i++) {
            arr.push(
                new Beam(edit, cellNodes[i - 1][0], cellNodes[i][0], 0, 1)
            );
            arr.push(
                new Beam(edit, cellNodes[i - 1][2], cellNodes[i][2], 0, 1)
            );
        }

        for (var i = 0; i < arr.length; i++) {
            [].push.apply(cellElemNumbers, arr[i].GetAllNumbersElements());
        }
    }

    /**
     * ������� �������� �� ���� ������ � ����������� �� ��������� ���������� �� ��������
     * @param {[number]} arrNumbers ������ � ����� �������� ������ ���� �������� �� ���� ������: [1, 5]1 ����� ������ ������ ���� �������� ������ 5 �� ����������
     */
    function CreateRacks(arrNumbers) {
        var minIndex = 1;
        var maxIndex = rightColumnNodes.length - 1;

        var arr = [];

        for (var i = 0; i < arrNumbers.length; i++) {
            if (arrNumbers[i] > maxIndex) {
                break;
            } else if (arrNumbers[i] <= minIndex) {
                continue;
            }

            arr.push(
                new Beam(
                    edit,
                    leftColumnNodes[arrNumbers[i] - 1],
                    rightColumnNodes[arrNumbers[i] - 1],
                    0,
                    1
                )
            );
        }

        for (var i = 0; i < arr.length; i++) {
            [].push.apply(racksElemNumbers, arr[i].GetAllNumbersElements());
        }
    }

    /**
     * ������� 2-� ������ ������ ����� ��� ����� �������
     * @param {[object]} arrNodes1 ������ ����� �1
     * @param {[object]} arrNodes2 ������ ����� �2
     * @param {number} offset ������ �� ������������ ����
     * @returns {[object]}  ���������� 2-� ������ ������ ����� ��� ����� �������
     */
    function AddCellNodesList(arrNodes1, arrNodes2, offset) {
        var returnArr = [];
        var arr = [];
        var j = 0;
        for (var i = 1; i < arrNodes1.length; i += 2) {
            arr.push(
                CreateNode(
                    edit,
                    arrNodes1[j].x,
                    arrNodes1[j].y - offset,
                    arrNodes1[j].z
                )
            );
            arr.push(arrNodes1[j]);
            arr.push(
                CreateNode(
                    edit,
                    arrNodes1[j].x,
                    arrNodes1[j].y + offset,
                    arrNodes1[j].z
                )
            );
            returnArr.push(arr);
            arr = [];

            arr.push(
                CreateNode(
                    edit,
                    arrNodes2[i].x,
                    arrNodes2[i].y - offset,
                    arrNodes2[i].z
                )
            );
            arr.push(arrNodes2[i]);
            arr.push(
                CreateNode(
                    edit,
                    arrNodes2[i].x,
                    arrNodes2[i].y + offset,
                    arrNodes2[i].z
                )
            );
            returnArr.push(arr);
            arr = [];
            j += 2;
        }
        if (arrNodes1.length % 2 != 0) {
            arr.push(
                CreateNode(
                    edit,
                    arrNodes1[arrNodes1.length - 1].x,
                    arrNodes1[arrNodes1.length - 1].y - offset,
                    arrNodes1[arrNodes1.length - 1].z
                )
            );
            arr.push(arrNodes1[j]);
            arr.push(
                CreateNode(
                    edit,
                    arrNodes1[arrNodes1.length - 1].x,
                    arrNodes1[arrNodes1.length - 1].y + offset,
                    arrNodes1[arrNodes1.length - 1].z
                )
            );
            returnArr.push(arr);
            arr = [];
        }

        return returnArr;
    }
    /**
     * ���������� ����� ����� ����� ��� ����� ��������
     * @param {boolean} isOneFoundation ��� ����: true - ������ ���� ����������� ������ � ����������� �������� ������ 250�� �� ��������
     * false - �� ������ ������� �������� 250�� ������� ����
     * @param {number} width ������ �������
     */
    function CreateBase(isOneFoundation, width) {
        if (isOneFoundation) {
            var nodeLeft = leftColumnNodes[0];
            var nodeRight = rightColumnNodes[0];

            var endNode = CreateNode(
                edit,
                nodeLeft.x + width / 2,
                nodeLeft.y,
                nodeLeft.z
            );
            var startNode = CreateNode(
                edit,
                nodeLeft.x + width / 2,
                nodeLeft.y,
                nodeLeft.z - 0.25
            );
            baseNodes.push(startNode);

            var column = new Beam(edit, startNode, endNode, 0, 0);
            [].push.apply(
                baseColumnElemNumbers,
                column.GetAllNumbersElements()
            );

            DOF("ColumnBase", 63, [nodeLeft, nodeRight, endNode]);
        } else {
            var nodeLeft = leftColumnNodes[0];
            var nodeRight = rightColumnNodes[0];

            var startNodeLeft = CreateNode(
                edit,
                nodeLeft.x,
                nodeLeft.y,
                nodeLeft.z - 0.25
            );
            baseNodes.push(startNodeLeft);

            var startNodeRight = CreateNode(
                edit,
                nodeRight.x,
                nodeRight.y,
                nodeRight.z - 0.25
            );
            baseNodes.push(startNodeRight);

            var colLeft = new Beam(edit, startNodeLeft, nodeLeft, 0, 0);
            [].push.apply(
                baseColumnElemNumbers,
                colLeft.GetAllNumbersElements()
            );
            var colRight = new Beam(edit, startNodeRight, nodeRight, 0, 0);
            [].push.apply(
                baseColumnElemNumbers,
                colRight.GetAllNumbersElements()
            );
        }
    }
    //#endregion

    /*****************************************/

    //#region Public Method
    /**
     * ������������ ��� ����������� ������
     * @param {number} angle ���� �������� ������
     */
    this.RotateTwoColumnAxes = function (angle) {
        if (supColumnNumbers.length != 0) {
            //������� �����
            RotateBeamAxes(edit, angle, leftColumnElemNumbers);
        }

        if (supColumnNumbers.length != 0) {
            //������� ������
            RotateBeamAxes(edit, angle, rightColumnElemNumbers);
        }

        if (baseColumnElemNumbers.length != 0) {
            //������� ������
            RotateBeamAxes(edit, angle, baseColumnElemNumbers);
        }
    };

    /**
     * ������������ ��� ������� �������
     * @param {number} angle ���� �������� ������
     */
    this.RotateSupColumnAxes = function (angle) {
        //������� �����
        if (supColumnNumbers.length != 0) {
            RotateBeamAxes(edit, angle, supColumnNumbers);
        }
    };

    /**
     *
     * @returns {[object]}  ���������� ������ ���� ����� ����� ����� �������
     */
    this.GetLeftColumNodes = function () {
        return leftColumnNodes;
    };

    /**
     *
     * @returns {[object]}  ���������� ������ ���� ����� ������ ����� �������
     */
    this.GetRightColumNodes = function () {
        return rightColumnNodes;
    };

    /**
     *
     * @returns {[object]}  ���������� ������ ���� ����������� ����� ������� �������
     */
    this.GetSupColumnCenterNodes = function () {
        return supCenterNodes;
    };

    /**
     * @returns ���������� ���� ��� �������� �����/����
     */
    this.GetLastObjNode = function () {
        return hieghtNodeForBeam;
    };
    /**
     * ������������ ���������� ���������� ���� � ���������� ����
     * @returns {object}  ������ ����
     */
    this.GetLastNodeCalculate = function () {
        var lastNodeObj = {
            x: X,
            y: Y,
            z: _hightTwoBeam + _hightSupColumn
        };
        return lastNodeObj;
    };
    /**
     * @returns {[[object], [object]]} ���������� ���� ����� ������� � 2� �������� ������ arr[1] ������ ���� �������,
     * ��������� ���� �����: [[nodeCell, nodeColumn, nodeCell], [nodeCell, nodeColumn, nodeCell], ....]
     */
    this.GetCellNodes = function () {
        return cellNodes;
    };

    /**
     * @returns ���������� ���� ����
     */
    this.GetBaseNodes = function () {
        return baseNodes;
    };

    /**
     * @returns ���������� ���� ��� ����������� �����, �������� ������ 2 ����
     */
    this.GetCraneBeamNodes = function () {
        return craneNodes;
    };
    /**
     *
     * @returns {[number]}  ���������� ������ ������� ��������� ����� ����� �������
     */
    this.GetLeftColumElemNumbers = function () {
        return leftColumnElemNumbers;
    };

    /**
     *
     * @returns {[number]}  ���������� ������ ������� ��������� ������ ����� �������
     */
    this.GetRightColumElemNumbers = function () {
        return rightColumnElemNumbers;
    };

    /**
     *
     * @returns {[number]}  ���������� ������ ������� ������� ����� ����� �������
     */
    this.GetTopSupBeamElemNumbers = function () {
        return hightSupBeamElemNumbers;
    };

    /**
     *
     * @returns {[number]}  ���������� ������ ������� ��������� ������� �������
     */
    this.GetSupColumnElemNumbers = function () {
        return supColumnNumbers;
    };

    /**
     *
     * @returns {[number]}  ���������� ������ ������� ��������� ����� �������
     */
    this.GetCellElemNumbers = function () {
        return cellElemNumbers;
    };

    /**
     *
     * @returns {[number]}  ���������� ������ ������� ��������
     */
    this.GetRacksElemNumbers = function () {
        return racksElemNumbers;
    };

    /**
     *
     * @returns {[number]}  ���������� ������ ������� ��������� ����
     */
    this.GetBaseElemNumbers = function () {
        return baseColumnElemNumbers;
    };

    /**
     *
     * @returns {[number]}  ���������� ������ ������� ���� ���������
     */
    this.GetAllNumbersElements = function () {
        var allNumbers = [];

        for (var i = 0; i < allElemNumbers.length; i++) {
            [].push.apply(allNumbers, allElemNumbers[i]);
        }

        return allNumbers;
    };
    /**
     * ���������� ����� �������
     */
    this.GetColumnLength = function () {
        var columnLength = _hightSupColumn + _hightTwoBeam;
        return columnLength;
    };
    /**
     * ���������� ����� ������� �������
     */
    this.GetSupColumnLength = function () {
        var supLenght = _hightSupColumn;
        return supLenght;
    };

    /**
     * ���������� ����� ������ �������
     */
    this.GetTwoColumnLength = function () {
        var twoColLen = _hightTwoBeam;
        return twoColLen;
    };

    /**
     * ���������� ������ ����� ������� �������
     */
    this.GetSliceArr = function () {
        return _sliceSupColumn;
    };

    /**
     * ������ ����� ������� �������.
     */
    this.SetSupColumnLength = function (length) {
        _hightSupColumn = length;
    };
    /**
     * ������ ����� ���� ������.
     */
    this.SetTwoColumnLength = function (length) {
        _hightTwoBeam = length;
    };
    /**
     * ������ ����� ������ ������ ��� ������� �������
     * @param {[number]} newArr ����� ������ ������
     */
    this.SetSliceArr = function (newArr) {
        _sliceSupColumn = newArr;
    };
    //#endregion

    /*****************************************/

    //#region Support Functions

    /**
     * �������� �����:
                -� ���������� �� �����
                -� ������ ������� ������������ �����
                -c ���������� ��������
    * @param {*} editor - SCAD ��������
    * @param {object} startNode - ������ ������� ����
    * @param {object} endNode - ������ ������� ���������� ����
    * @param {number} step - ���-�� ���������
    * @param {number} joint - ��������� �������� �� ����� ������: 0 ��� null - ������� ����������;
    * 															  1 - ������� �� Ux � Uy �� 2 ������
    * 															  2 - ������� �� Ux � Uy � ������
    * 														      3 - ������� �� Ux � Uy � �����
    */
    function Beam(editor, startNode, endNode, step, joint) {
        this.elementInfo = {
            id: "b_1",
            connect: 11
        };

        var elemNumberArr = []; //������ ������� ���������
        var nodeNumberArr = []; //������ �������� �����
        var centerNodeObjArr = []; //������ ����������� �������� �����
        this.joint = joint;
        //#region ��������
        if (step <= 0) {
            step = 1;
        }

        if (joint > 3 || joint < 0) {
            joint = 1;
        }

        //#endregion

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
            //#endregion
        } else {
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
        this.GetAllNumbersElements = function () {
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
    }

    /**
 * �������� �����:
 			-� ���������� �� 2 ����� � ������� ���������� �� ���������� ���� �� ������������
			 -� ������ ������� ������������ �����
			 -c ���������� ��������
 * @param {*} editor - �������� �������� ��������
 * @param {object} startNode - ������ ������� ����
 * @param {object} endNode - ������ ������� ���������� ����
 * @param {number} step - ���������� �� ���������� ���� �� ������������
 * @param {number} joint - ��������� �������� �� ����� ������: 0 ��� null - ������� ����������;
 * 															  1 - ������� �� Ux � Uy �� 2 ������
 * 															  2 - ������� �� Ux � Uy � ������
 * 														      3 - ������� �� Ux � Uy � �����
 */
    function BeamLenghtCenter(editor, startNode, endNode, step, joint) {
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
            (editor.ElemUpdate(eI, curElem)); //�������� ��������

            elemNumberArr.push(eI);
            nodeNumberArr.push(startNode);
            nodeNumberArr.push(endNode);

            //#region ���������� �������� �� 2 ������
            if (this.joint == 1) {
                (editor.JointSet(eI, 1, Joint));
                (editor.JointSet(eI, 2, Joint));
            } else if (this.joint == 2) {
                (editor.JointSet(eI, 1, Joint)); //������ �������
            } else if (this.joint == 3) {
                (editor.JointSet(eI, 2, Joint)); //��������� �������
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
                (editor.NodeUpdate(midleNodeNum + i, curNode)); //�������� ������ ����
                curElem.ListNode[1] = midleNodeNum + i; //���������� 2 ���� ��� ��������
                (editor.ElemUpdate(eI + i, curElem)); //�������� ��������

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
            (editor.ElemUpdate(eI + nQ, curElem));

            elemNumberArr.push(eI + nQ);
            nodeNumberArr.push(endNode);
            //#endregion

            //#region ���������� ��������
            //�� 2 ������
            if (this.joint == 1) {
                (editor.JointSet(eI, 1, Joint)); //������ �������
                (editor.JointSet(eI + nQ, 2, Joint)); //��������� �������
            }
            //������ � ������
            if (this.joint == 2) {
                (editor.JointSet(eI, 1, Joint)); //������ �������
            }
            //������ � �����
            if (this.joint == 3) {
                (editor.JointSet(eI + nQ, 2, Joint)); //��������� �������
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
        this.GetAllNumbersElements = function () {
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
                (editor.JointSet(eI, 1, Joint));
                (editor.JointSet(eI, 2, Joint));
            } else if (numbJoint == 2) {
                (editor.JointSet(eI, 1, Joint)); //������ �������
            } else if (numbJoint == 3) {
                (editor.JointSet(eI, 2, Joint)); //��������� �������
            }
        };
        /**
         * ��������� ����� �������, ����� �������� ��������� � ����������� �� ���������.
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
     * ������� ������������ ������������ ������� �������� ������. ���������� �� ���������� ����
     * @param {*} editor
     * @param {number} lenZ ������ �������.
     * @param {number} startNode ��������� ���� � �������� ���������� �������.
     * @param {[number]} lengtSliceArr ������ ����������, �� ���������� ����, �� ������� ������� �������. ������ ������ ��������� ��������
     * ����������. ������ ����� ����� lenZ = 10� ������� �� 2 ������ ����� lengtSliceArr = [5]
     */
    function ColumnSliceSCAD(editor, lenZ, startNode, lengtSliceArr) {
        this.elementInfo = {
            id: "c_5",
            connect: 1
        };

        var elemNumberArr = []; //������ ������� ���������
        var nodeNumberArr = []; //������ �������� �����
        var centerNodeObjArr = []; //������ ����������� �������� �����

        if (startNode != null) {
            nodeNumberArr.push(startNode);
        }

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
                if (startNode == null) {
                    nQ = 2; //���������� �����
                    baseNodeNum = editor.NodeAdd(nQ); //����� ������� ����
                    endNodeNum = countNod + baseNodeNum;
                } else {
                    nQ = 1; //���������� �����
                    baseNodeNum = startNode.nodeNum; //����� ������� ����
                    endNodeNum = editor.NodeAdd(nQ); //����� ���������� ����
                }

                eQ = 1; //���-�� ���������
                baseElemNum = editor.ElemAdd(eQ); // ����� ������� ��������
                eI = baseElemNum; // ����� ������� ��������
                elemNumberArr.push(eI);

                //#region �������� ���������, �����

                if (startNode == null) {
                    curNode = {
                        x: 0,
                        y: 0,
                        z: 0
                    }; //������ � ������������, ��� �����

                    editor.NodeUpdate(baseNodeNum, curNode);
                    AddNode(baseNodeNum, curNode, nodeNumberArr);

                    curNode.z = columnLength;
                    editor.NodeUpdate(endNodeNum, curNode);
                    AddNode(endNodeNum, curNode, nodeNumberArr);

                    curElem.ListNode[0] = baseNodeNum; //������ ����� � ������ ��� �������� ����
                    curElem.ListNode[1] = endNodeNum; //������ ����� � ������ ��� �������� ����
                } else {
                    curNode = {
                        x: startNode.x,
                        y: startNode.y,
                        z: startNode.z + columnLength
                    }; //������ � ������������, ��� �����
                    editor.NodeUpdate(endNodeNum, curNode);
                    AddNode(endNodeNum, curNode, nodeNumberArr);

                    curElem.ListNode[0] = baseNodeNum; //������ ����� � ������ �������� ����
                    curElem.ListNode[1] = endNodeNum; //������ ����� � ������ �������� ����
                }
                //�������� ��������
                editor.ElemUpdate(eI, curElem);

                //#endregion
            } else {
                nQ = correctLenArr.length + 1;
                baseNodeNum = editor.NodeAdd(nQ); //����� ������� ����

                eQ = correctLenArr.length + 1; //���-�� ���������
                baseElemNum = editor.ElemAdd(eQ); // ����� ������� ��������
                eI = baseElemNum; // ����� ������� ��������

                //#region �������� ���������, �����
                var hieghtZ = 0;
                curElem.ListNode[0] = startNode.nodeNum;

                for (var i = 0; i < correctLenArr.length; i++) {
                    hieghtZ += correctLenArr[i];

                    //����
                    curNode = {
                        x: startNode.x,
                        y: startNode.y,
                        z: startNode.z + hieghtZ
                    }; //������ � ������������, ��� �����
                    editor.NodeUpdate(baseNodeNum + i, curNode);
                    AddNode(baseNodeNum + i, curNode, nodeNumberArr);
                    AddNode(baseNodeNum + i, curNode, centerNodeObjArr);

                    //�������� ��������
                    curElem.ListNode[1] = baseNodeNum + i; //������ ����� � ������ ��� �������� ����
                    editor.ElemUpdate(eI + i, curElem);
                    elemNumberArr.push(eI + i); //������ �������
                    curElem.ListNode[0] = baseNodeNum + i;
                }

                //����
                curNode = {
                    x: startNode.x,
                    y: startNode.y,
                    z: startNode.z + columnLength
                }; //������ � ������������, ��� �����
                editor.NodeUpdate(baseNodeNum + nQ - 1, curNode);
                AddNode(baseNodeNum + nQ - 1, curNode, nodeNumberArr);

                //�������� ��������
                curElem.ListNode[1] = baseNodeNum + nQ - 1;
                editor.ElemUpdate(eI + nQ - 1, curElem);
                elemNumberArr.push(eI + nQ - 1); //������ �������
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
         * ������������ ���������� ���������� ���� � ���������� ����
         * @returns {object}  ������ ����
         */
        this.GetLastNodeCalculate = function () {
            var lastNodeObj = {
                x: startNode.x,
                y: startNode.y,
                z: startNode.z + lenZ
            };
            return lastNodeObj;
        };
        /**
         * ���������� ������ ���������� ���� �� ������ �����
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
         * ������������ ����� �� �������� ������� ��� ���������� ������ ����� �� ������� ����� �������
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
     * ������������ ������� ��� ��������� �� �������� ����
     * @param {*} editor SCAD
     * @param {number} angel �������� ���� � ��������
     * @param {[number]} listElem ������ ������� ���������
     */
    function RotateBeamAxes(editor, angel, listElem) {
        var sysCoordElem = {
            Text: "",
            Type: 1,
            GroupElem: 1,
            ListData: [angel],
            ListElem: listElem
        };
        editor.SystemCoordElemAdd(sysCoordElem);
    }

    /**
     * ������� ����������� ����������� �� ����� � ��������� �����
     * @param {string} text ��������
     * @param {number} mask ����� �����������
     * @param {[number]} list ���� ������������ �����
     */
    function DOF(text, mask, list) {
        if (list.length == 0 || list == null) {
            return;
        }

        var nodeNumArr = [];
        for (var i = 0; i < list.length; i++) {
            nodeNumArr.push(list[i].nodeNum);
        }

        var DOFUnion = {
            Text: text,
            Mask: mask,
            ListNode: nodeNumArr
        };

        edit.DOFUnionAdd(DOFUnion); //����������� ���� �����
    }

    //#endregion
}

//#endregion
