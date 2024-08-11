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
        var node_2 = CreateNode(editor, 12, 0, 0);
 
        //�������� ������� �1
        var truss_1 = new TrussMolodechReversTyp2(editor, node_1, node_2, 4, 1, 2, true, true, true, true);
        truss_1.Create();

        //����� ���������� �� �������
        var nodeArr = truss_1.GetAllNodesBottom(); //��� ������� �����
        var elemNumbArr = truss_1.GetAllNumbersElementsBot(); //��� ������ ��������� ������� �����

    } catch (e) {
        engine.Cancel(e);
    }
}

//===============================================================================
//#region SCAD Functionsl

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
 * ������ ��� �������� ����� ������������ �� ����� ���������� c ������������ ������
 *  �����:
 * -������� �� ��������/�������
 * -�� ����� ���� ������� � ����� �����
 * @param {*} editor SCAD
 * @param {object} startNode ��������� ����
 * @param {object} endNode ��������� ����
 * @param {number} numbSection ���������� �������
 * @param {number} hightStart ��������� ������
 * @param {number} hightRise ������ � ������
 * @param {boolean} enableJoint ��������� ���������� �������� �� ���� ������� �����
 * @param {boolean} enableRacksBeam ��������� ������ ����� ��� ���: true - ���������
 * @param {boolean} enableCellPillar �������� ���������: true - ��������
 * @param {boolean} enableCenterRack ��������� ����������� ������: true - ��������
 */
 function TrussMolodechReversTyp2(
    editor,
    startNode,
    endNode,
    numbSection,
    hightStart,
    hightRise,
    enableJoint,
    enableRacksBeam,
    enableCellPillar,
    enableCenterRack
) {
    this.elementInfo = {
        id: "t_7",
        connect: 11,
        role: "center",
        incline: false,
        column: true
    };

    var _editor = editor;
    var _startNode = startNode;
    var _endNode = endNode;
    var _numbSection = numbSection;
    var _hightStart = hightStart;
    var _hightRise = hightRise;
    var _enableJoint = enableJoint;
    var _enableRacksBeam = enableRacksBeam;
    var _enableCellPillar = enableCellPillar;
    var _enableCenterRack = enableCenterRack;
    var _topStartNode = null;
    var _topEndNode = null;

    // �������� 
    if (_hightRise < _hightStart) {
        _hightRise = _hightStart;
    }
    if (_numbSection < 2) {
        _numbSection = 2;
    }
    var lengTopReg = 0; //����� ������� �������� �����
    var lengTopElem = 0; //����� �������� ����� ���������

    var topNodeArr = []; //������ ����� �������� �����
    var botNodeArr = []; // ������ ����� ������� �����
    var startNodeArr = [_startNode, _endNode]; //������ ������� �����

    var topElNumbArr = []; //������ ��������� �������� �����
    var botElNumbArr = []; //������ ��������� ������� �����
    var cellElNumbArr = []; //������ ������� ��������� �������
    var pillarCellElNumbArr = []; //������ ������� ��������� ������� ��������
    var racksElNumbArr = []; //������ ������� ��������� �����
    var pillarRacksArr = []; //������ ������� ������� ������
    var ae_cellPillar = []; //������ ��������� ����������
    var ae_column = []; //������ ������
    var ae_centerRack = []; //������ ������� ����������� ������

    var trussLen = 0; //����� �����

    //��������� ����
    var hightNode;

    var topLenRegion = 0; //����� ������� � ����������

    /**
     * �������� �����
     */
    this.Create = function () {
        CreateTopBeam();
        CreateBotBeam();
        CreateCell();
        CreateRacks();
    };

    //#region private
    /**
     * �������� �������� ����� �����
     */
    function CreateTopBeam() {
        _topStartNode = CreateNode(
            _editor,
            _startNode.x,
            _startNode.y,
            _startNode.z + _hightStart
        );
        _topEndNode = CreateNode(
            _editor,
            _endNode.x,
            _endNode.y,
            _endNode.z + _hightStart
        );
        trussLen = _endNode.x - _startNode.x; //����� �����
        hightNode = CreateNode(
            _editor,
            _topStartNode.x + trussLen / 2,
            _topStartNode.y,
            _topStartNode.z + (_hightRise - _hightStart)
        );

        //#region ������� ����
        var topBeam;
        var topBeamR;
        var topNumSection = 0;
        if (_enableRacksBeam) {
            topNumSection = _numbSection * 2 + 1;
            topBeam = new Beam(
                _editor,
                _topStartNode,
                hightNode,
                topNumSection,
                2
            ); //�����  �����
            topBeamR = new Beam(
                _editor,
                hightNode,
                _topEndNode,
                topNumSection,
                3
            ); //������  �����
            topNodeArr = topBeam.GetAllNodes(); //������ ����� �������� �����
            [].push.apply(topNodeArr, topBeamR.GetAllNodes()); //���������� ����� �������� ����� �� ������ �����
            topNodeArr = UniqArrObjNode(topNodeArr);
        } else {
            topNumSection = _numbSection;
            topBeam = new BeamOffT2(
                _editor,
                _topStartNode,
                hightNode,
                topNumSection,
                2
            ); //�����  �����
            topBeamR = new BeamOffT2(
                _editor,
                _topEndNode,
                hightNode,
                topNumSection,
                2
            ); //������  �����
            topNodeArr = topBeam.GetAllNodes(); //������ ����� �������� �����
            [].push.apply(topNodeArr, topBeamR.GetAllNodes().reverse()); //���������� ����� �������� ����� �� ������ �����
            topNodeArr = UniqArrObjNode(topNodeArr);
        }
        //���������� ��������
        [].push.apply(topElNumbArr, topBeam.GetAllNumbersElements());
        [].push.apply(topElNumbArr, topBeamR.GetAllNumbersElements());

        topLenRegion = topBeam.GetLengthRegion().lenX; //����� ������� � ����������

        lengTopReg = topBeam.GetLengthRegion().lenghtReg;
        lengTopElem = topBeam.GetLengthRegion().lengthElement;

        //#endregion
    }

    /**
     * �������� ������� ����� �����
     */
    function CreateBotBeam() {
        //#region ������ ����

        var bottomBeam = new Beam(
            _editor,
            _startNode,
            _endNode,
            (_numbSection * 2 + 1) * 2,
            1
        );

        botNodeArr = bottomBeam.GetAllNodes(); //������ ����� ������� �����
        botElNumbArr = bottomBeam.GetAllNumbersElements();

        //#endregion
    }

    /**
     * �������� ����� �����
     */
    function CreateCell() {
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }

        //#region �������
        var trussElArr = []; //������ ��������� ��������
        var cellPillarElArr = []; //������ ��������� ����������

        if (_enableRacksBeam) {
            //������� ������ �����
            if (_enableCellPillar) {
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[0],
                        topNodeArr[1],
                        2,
                        enableCellJoint
                    )
                );
                //���������
                cellPillarElArr.push(
                    new Beam(
                        _editor,
                        trussElArr[trussElArr.length - 1].GetCenterNodes()[0],
                        topNodeArr[0],
                        1,
                        enableCellJoint
                    )
                ); //���������������� ������
            } else {
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[0],
                        topNodeArr[1],
                        1,
                        enableCellJoint
                    )
                );
            }
            //������� �����
            for (var i = 3; i < topNodeArr.length; i += 2) {
                trussElArr.push(
                    new Beam(
                        _editor,
                        topNodeArr[i - 2],
                        botNodeArr[i - 1],
                        1,
                        enableCellJoint
                    )
                ); //�� ����� � ����
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[i - 1],
                        topNodeArr[i],
                        1,
                        enableCellJoint
                    )
                ); //�� ���� � �����
            }

            // ������� ������ ������
            if (_enableCellPillar) {
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[botNodeArr.length - 1],
                        topNodeArr[topNodeArr.length - 2],
                        2,
                        enableCellJoint
                    )
                );
                //���������
                cellPillarElArr.push(
                    new Beam(
                        _editor,
                        trussElArr[trussElArr.length - 1].GetCenterNodes()[0],
                        topNodeArr[topNodeArr.length - 1],
                        1,
                        enableCellJoint
                    )
                ); //���������������� ������
            } else {
                trussElArr.push(
                    new Beam(
                        _editor,
                        topNodeArr[topNodeArr.length - 2],
                        botNodeArr[botNodeArr.length - 1],
                        1,
                        enableCellJoint
                    )
                );
            }
        } else {
            //������� ������ �����
            if (_enableCellPillar) {
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[0],
                        topNodeArr[1],
                        2,
                        enableCellJoint
                    )
                );
                //���������
                cellPillarElArr.push(
                    new Beam(
                        _editor,
                        trussElArr[trussElArr.length - 1].GetCenterNodes()[0],
                        topNodeArr[0],
                        1,
                        enableCellJoint
                    )
                );
            } else {
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[0],
                        topNodeArr[1],
                        1,
                        enableCellJoint
                    )
                );
            }
            //������� �����
            var j = 2;
            for (var i = 2; i < topNodeArr.length - 1; i++) {
                trussElArr.push(
                    new Beam(
                        _editor,
                        topNodeArr[i - 1],
                        botNodeArr[j],
                        1,
                        enableCellJoint
                    )
                ); //�� ����� � ���
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[j],
                        topNodeArr[i],
                        1,
                        enableCellJoint
                    )
                ); //�� ���� � �����
                j += 2;
            }
            // ������� ������ ������
            if (_enableCellPillar) {
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[botNodeArr.length - 1],
                        topNodeArr[topNodeArr.length - 2],
                        2,
                        enableCellJoint
                    )
                );
                //���������
                cellPillarElArr.push(
                    new Beam(
                        _editor,
                        trussElArr[trussElArr.length - 1].GetCenterNodes()[0],
                        topNodeArr[topNodeArr.length - 1],
                        1,
                        enableCellJoint
                    )
                );
            } else {
                trussElArr.push(
                    new Beam(
                        _editor,
                        topNodeArr[topNodeArr.length - 2],
                        botNodeArr[botNodeArr.length - 1],
                        1,
                        enableCellJoint
                    )
                );
            }
        }

        //���� ������� ���������, �� �������� ������ ������� �� ������� ��������
        if (enableCellJoint == 0) {
            trussElArr[0].SetJoinNumber(2);

            if (_enableCellPillar) {
                cellPillarElArr[0].SetJoinNumber(3);
                cellPillarElArr[1].SetJoinNumber(3);
                trussElArr[trussElArr.length - 1].SetJoinNumber(2);
            } else {
                trussElArr[trussElArr.length - 1].SetJoinNumber(3);
            }
        }
        //���������� �������� ��������� ��������
        for (var i = 0; i < trussElArr.length; i++) {
            if (
                i == 0 ||
                i == 1 ||
                i == trussElArr.length - 1 ||
                i == trussElArr.length - 2
            ) {
                [].push.apply(
                    pillarCellElNumbArr,
                    trussElArr[i].GetAllNumbersElements()
                );
            } else {
                [].push.apply(
                    cellElNumbArr,
                    trussElArr[i].GetAllNumbersElements()
                );
            }
        }

        //���������� �������� ��������� ����������
        if (_enableCellPillar) {
            for (var i = 0; i < cellPillarElArr.length; i++) {
                [].push.apply(
                    ae_cellPillar,
                    cellPillarElArr[i].GetAllNumbersElements()
                );
            }
        }
        //#endregion
    }
    /**
     * ������ �����
     */
    function CreateRacks() {
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }
        //#region ������� ������
        //�������
        var pilRackLeft = new Beam(_editor, _startNode, _topStartNode, 0, 0);
        [].push.apply(ae_column, pilRackLeft.GetAllNumbersElements());
        var pilRackRight = new Beam(_editor, _endNode, _topEndNode, 0, 0);
        [].push.apply(ae_column, pilRackRight.GetAllNumbersElements());

        if (_enableCenterRack) {
            var centerRack = new Beam(
                _editor,
                botNodeArr[(botNodeArr.length - 1) / 2],
                topNodeArr[(topNodeArr.length - 1) / 2],
                1,
                enableCellJoint
            );
            ae_centerRack = centerRack.GetAllNumbersElements();
        }
        var trussRacksElArr = []; //������ ��������� �����
        if (_enableRacksBeam) {
            for (var i = 2; i < topNodeArr.length - 1; i += 2) {
                //������� ������
                // if(i == (topNodeArr.length-1)/2){
                //   continue;
                // }
                trussRacksElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[i],
                        topNodeArr[i],
                        1,
                        enableCellJoint
                    )
                ); //�� ���� � �����
            }
        }

        for (var i = 0; i < trussRacksElArr.length; i++) {
            [].push.apply(
                racksElNumbArr,
                trussRacksElArr[i].GetAllNumbersElements()
            );
        }
        //#endregion
    }

    //#endregion
    /**
     * @returns {[]} ���������� ������ �� ������� �����
     */
    this.GetStartNode = function () {
        return startNodeArr;
    };

    /**
     * @returns {[]} ���������� ������ ���� ����� �������� �����
     */
    this.GetAllNodesTop = function () {
        return topNodeArr;
    };

    /**
     * @returns {[]} ���������� ������ ���� ����� ������� �����
     */
    this.GetAllNodesBottom = function () {
        return botNodeArr;
    };
    /**
     * @returns {[]} ���������� ������ ����� ��� ������������� ������
     */
    this.GetRightConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(
            botNodeArr[botNodeArr.length - 1],
            topNodeArr[topNodeArr.length - 1]
        );
        return connectionNodesArr;
    };
    /**
     * @returns {[]} ���������� ������ ����� ��� ������������� �����
     */
    this.GetLeftConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(botNodeArr[0], topNodeArr[0]);
        return connectionNodesArr;
    };
    /**
     * @returns {[]} ���������� ������ ������� ��������� �������� �����
     */
    this.GetAllNumbersElementsTop = function () {
        return topElNumbArr;
    };

    /**
     * @returns {[]} ���������� ������ ������� ��������� ������� �����
     */
    this.GetAllNumbersElementsBot = function () {
        return botElNumbArr;
    };

    /**
     * @returns {[]} ���������� ������ ������� ��������� ��������
     */
    this.GetAllNumbersElementsCell = function () {
        return cellElNumbArr;
    };

    /**
     * @returns {[]} ���������� ������ ������� ��������� �����
     */
    this.GetAllNumbersElementsRacks = function () {
        return racksElNumbArr;
    };

    /**
     * @returns {[]} ���������� ������ ������� ��������� ������� ��������
     */
    this.GetAllNumbersElementsPillarCell = function () {
        return pillarCellElNumbArr;
    };
    /**
     * @returns {[]} ���������� ������ ������� ��������� ������
     */
    this.GetColumnNumbersElements = function () {
        return ae_column;
    };
    /**
     * @returns {[]} ���������� ������ ������� ��������� ����������
     */
    this.GetAllNumbersElementsRacksCell = function () {
        return ae_cellPillar;
    };

    /**
     * @returns {[]} ���������� ������ ������� ��������� ����������� ������
     */
    this.GetNumberElementsCenterRack = function () {
        return ae_centerRack;
    };

    /**
     * @returns {number} ���������� ������ ������� ������ (�� ������� �� �������)
     */
    this.GetAllLenghTopBeamReg = function () {
        return parseFloat(lengTopReg);
    };

    /**
     * ���������� ���������� ���� ������� �������� ����� ����� � ��������
     */
    this.GetAngleTruss = function () {
        var a = lengTopElem; //����� �������� ����� ���������
        var b = trussLen / 2;
        var c = hightNode.z - startNode.z;

        var cosA = (a * a + b * b - c * c) / (2 * a * b);
        var radA = Math.acos(cosA);
        var numbAngelA = radA * (180 / Math.PI);

        return numbAngelA;
    };
    /**
     *
     * @returns {number} ���������� ������ �� ���� ������� ��������� � �����
     */
    this.GetAllElemNumbers = function () {
        var allNumbersElemArr = [];
        [].push.apply(allNumbersElemArr, cellElNumbArr);
        [].push.apply(allNumbersElemArr, topElNumbArr);
        [].push.apply(allNumbersElemArr, botElNumbArr);
        [].push.apply(allNumbersElemArr, pillarCellElNumbArr);
        [].push.apply(allNumbersElemArr, racksElNumbArr);
        [].push.apply(allNumbersElemArr, pillarRacksArr);

        return allNumbersElemArr;
    };

    /**
     * @returns {number} ���������� ������ ����� � �����
     */
    this.GetTrussHeightInPillar = function () {
        var height = 0;

        if (this.elementInfo.column) {
            height = _hightStart;
        }
        return height;
    };

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
 * �������� ����� c 1 ����������� ������ �������� ��������� ����������(��� ����� � ����������� ������ � ��������� ������ �������):
 			-� ���������� �� �����
			-� ������ ������ ������������ �����
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
    function BeamOffT2(editor, startNode, endNode, step, joint) {
        this.elementInfo = {
            id: "b_6",
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

        var curElem = { TypeElem: 5, ListNode: [0, 0] }; //�������� ������� - ��� �������� 5, ������ �����[start, end]
        var Joint = { Mask: 48, Place: 1 }; //������ ��� ������� ��������
        //#endregion

        //#region ����
        //���� ���������� ������� ������� �� ����������� ����� ����
        if (step > 1) {
            var eQ = step + 1; //���-�� ���������
            var baseElemNum = editor.ElemAdd(eQ); // ���� ������ �������� � ���������, ����� ������� ��������
            var eI = baseElemNum; // ����� ������� ��������
            var nQ = step; //���������� �����
            var midleNodeNum = editor.NodeAdd(nQ); //����� ������� ����

            //����������� ����� �������� �� ���� ����������� ����� ������
            var objLenCoor = LenghtRegion(startNode, endNode, step);

            var curNode = {
                x: startNode.x + objLenCoor.lenX / 2,
                y: startNode.y + objLenCoor.lenY / 2,
                z: startNode.z + objLenCoor.lenZ / 2
            };
            //#region ��������
            curElem.ListNode[0] = startNode.nodeNum; //���������� 1 ���� ��� ��������, ��������� ����
            nodeNumberArr.push(startNode);

            var j = 0;
            editor.NodeUpdate(midleNodeNum + j, curNode); //�������� ������ ����
            curElem.ListNode[1] = midleNodeNum + j; //���������� 2 ���� ��� ��������
            editor.ElemUpdate(eI + j, curElem); //�������� ��������

            for (var i = 0; i < nQ - 1; i++) {
                //���������� �������� ����������
                elemNumberArr.push(eI + j);

                //������ ��� ������ �����
                var nodeObj = {
                    nodeNum: midleNodeNum + j,
                    x: curNode.x,
                    y: curNode.y,
                    z: curNode.z
                };

                nodeNumberArr.push(nodeObj); //������ ���� � ������
                centerNodeObjArr.push(nodeObj); //������ ���� � ������

                curNode.x += objLenCoor.lenX;
                curNode.y += objLenCoor.lenY;
                curNode.z += objLenCoor.lenZ;

                curElem.ListNode[0] = midleNodeNum + j;
                j++;
                editor.NodeUpdate(midleNodeNum + j, curNode); //�������� ������ ����
                curElem.ListNode[1] = midleNodeNum + j; //���������� 2 ���� ��� ��������
                editor.ElemUpdate(eI + j, curElem); //�������� ��������
            }

            var nodeObj = {
                nodeNum: midleNodeNum + j,
                x: curNode.x,
                y: curNode.y,
                z: curNode.z
            };
            //���������� ������ ��������
            elemNumberArr.push(eI + j);
            nodeNumberArr.push(nodeObj); //������ ���� � ������
            centerNodeObjArr.push(nodeObj); //������ ���� � ������

            curElem.ListNode[0] = midleNodeNum + j;
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
            var eQ = step; //���-�� ���������
            var baseElemNum = editor.ElemAdd(eQ); // ���� ������ �������� � ���������, ����� ������� ��������
            var eI = baseElemNum; // ����� ������� ��������
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

            var lenReg = parseFloat((lenEl * 2) / (step * 2 + 1));
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
     * ������� ��������� ���������� ���� ������� ��������� �� ��������
     * � ������� ����������� �������� � ����������� ������� � �������
     * @param {[]} arr - ������ ���������
     * @returns {[]} ������ ���������� ���������
     */
    function UniqArrObjNode(arr) {
        var arr2 = [];

        for (var i = 0; i < arr.length; i++) {
            for (var k = 0; k < arr.length; k++) {
                if (k != i) {
                    if (arr[i].nodeNum == arr[k].nodeNum) arr[k] = "";
                }
            }
        }

        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == "") continue;
            else arr2.push(arr[i]);
        }
        return arr2;
    }

    //#endregion
}

//#endregion
