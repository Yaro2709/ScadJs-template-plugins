//encoding windows 1251 !!!
//� ����� ����������� ���  ��� ������ �������. ��� ������������� ���������� ��� ����������

/**
 * ������ ��� �������� �����. ���������
 *   �����:
 * -����: ���������� c ���������� ������
 * -�������
 * -����� ���� ������� � ����� �����
 * @param {*} editor SCAD
 * @param {object} startNode ��������� ����
 * @param {object} endNode ��������� ����
 * @param {number} numbSection ���������� �������, ���. = 2 ��
 * @param {number} hight ������ �����
 * @param {boolean} enableJoint ��������� ���������� �������� �� ���� ������� �����
 * @param {boolean} enableRacksBeam ��������� ������ ����� ��� ���: true - ���������
 * @param {boolean} enableCellPillar ������� ���������: true - �������
 */
function TrussAngleReversTyp1(
    editor,
    startNode,
    endNode,
    numbSection,
    hight,
    enableJoint,
    enableRacksBeam,
    enableCellPillar
) {
    this.elementInfo = {
        id: "t_5",
        connect: 11,
        role: "center",
        incline: true,
        column: true
    };
    var _editor = editor;
    var _startNode = startNode;
    var _endNode = endNode;
    var _topStartNode = null;
    var _topEndNode = null;
    var _numbSection = numbSection;
    var _hight = hight;
    var _enableJoint = enableJoint;
    var _enableCellPillar = enableCellPillar;
    var _enableRacksBeam = enableRacksBeam;

    // ��������
    if (_hight < 0.2) {
        _hight = 0.2;
    }

    if (_numbSection < 2) {
        _numbSection = 2;
    }

    var lengTopReg = 0; //����� ������� �������� �����
    var lengTopElem = 0; //����� �������� ����� ���������

    var topNodeArr = []; //������ ����� �������� �����
    var botNodeArr = []; // ������ ����� ������� �����
    var startNodeArr = []; //������ ������� �����

    var trussRacksElArr = []; //������ ��������� �����
    var topElNumbArr = []; //������ ��������� �������� �����
    var botElNumbArr = []; //������ ��������� ������� �����
    var cellElNumbArr = []; //������ ������� ��������� �������
    var pillarCellElNumbArr = []; //������ ������� ��������� ������� ��������
    var racksElNumbArr = []; //������ ������� ��������� �����
    var pillarRacksArr = []; //������ ������� ������� ������
    var ae_column = []; //������ ������
    var ae_cellPillar = []; //������ ��������� ����������

    var trussLen = 0; //����� �����

    var trussHight = 0; //������ �����
    //��������� ����
    var hightNode;
    var topNumSection = 0;
    var topLenRegion = 0; //����� ������� � ����������
    var _lenRegion; //����� ������� � ����������

    /**
     * �������� �����
     */
    this.Create = function () {
        _lenRegion = LengthSectionTruss();
        CreateTopBeam();

        CreateBotBeam();

        CreateCell();

        CreateSupportColumn();

        CreateRacks();
    };
    //#region private

    /**
     * �������� �������� ����� �����
     */
    function CreateTopBeam() {
        //#region ������� ����
        var deltaHight = ConvertLenghtByAngl(AngelTruss(), _hight);
        _topStartNode = CreateNode(
            _editor,
            _startNode.x,
            _startNode.y,
            _startNode.z + deltaHight
        );
        _topEndNode = CreateNode(
            _editor,
            _endNode.x,
            _endNode.y,
            _endNode.z + deltaHight
        );
        var topNumSection = 0;
        var topBeam;
        if (_enableRacksBeam) {
            topNumSection = _numbSection * 2;
            topBeam = new Beam(
                _editor,
                _topStartNode,
                _topEndNode,
                topNumSection,
                1
            ); //������� �������� �����
        } else {
            topNumSection = _numbSection;
            topBeam = new BeamOffset(
                _editor,
                _topStartNode,
                _topEndNode,
                topNumSection,
                1
            ); //������� �������� �����
        }
        //���������� ��������
        [].push.apply(topElNumbArr, topBeam.GetAllNumbersElements());
        //���������� ���� ����� �������

        topLenRegion = topBeam.GetLengthRegion().lenghtReg; //����� ������� � ����������

        topNodeArr = topBeam.GetAllNodes(); //������ ����� �������� �����

        lengTopReg = topBeam.GetLengthRegion().lenghtReg;
        lengTopElem = topBeam.GetLengthRegion().lengthElement;
        //#endregion
    }
    /**
     * �������� ������� ����� �����
     */
    function CreateBotBeam() {
        //#region ������ ����

        var angleCell = AngelCell();
        var calcLenObj1 = CreateStartBottomNode(90 + angleCell + AngelTruss());
        var calcLenObj2 = CreateStartBottomNode(90 + angleCell - AngelTruss());

        var bottomStartNode = CreateNode(
            _editor,
            _topStartNode.x - calcLenObj1.x,
            _topStartNode.y,
            _topStartNode.z - calcLenObj1.z
        );
        var bottomEndNode = CreateNode(
            _editor,
            _topEndNode.x + calcLenObj2.x,
            _topEndNode.y,
            _topEndNode.z - calcLenObj2.z
        );

        var bottomBeam = new Beam(
            _editor,
            bottomStartNode,
            bottomEndNode,
            _numbSection * 2 - 2,
            0
        );
        botNodeArr = bottomBeam.GetAllNodes(); //������ ����� ������� �����
        botNodeArr.unshift(_startNode);
        botNodeArr.push(_endNode);
        botElNumbArr = bottomBeam.GetAllNumbersElements();

        //�������������� ���� ��� �������� � ���������� ����� �� �����

        var supBeamBotLeft = new Beam(
            _editor,
            _startNode,
            bottomStartNode,
            0,
            2
        );
        [].push.apply(botElNumbArr, supBeamBotLeft.GetAllNumbersElements());

        var supBeamBotRight = new Beam(_editor, bottomEndNode, _endNode, 0, 3);
        [].push.apply(botElNumbArr, supBeamBotRight.GetAllNumbersElements());

        //#endregion
    }
    /**
     * �������� ����� �����
     */
    function CreateCell() {
        //#region �������
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }
        var cellPillarElArr = []; //������ ��������� ����������
        var trussElArr = []; //������ ��������� ���������
        //������� ������ �����
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
                ); //�� ����� � ����
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
    }
    //#endregion

    /**
     * ������� �������
     */
    function CreateSupportColumn() {
        //#region ������� ������

        var pilRackLeft = new Beam(_editor, _startNode, _topStartNode, 0, 0);
        [].push.apply(ae_column, pilRackLeft.GetAllNumbersElements());
        var pilRackRight = new Beam(_editor, _endNode, _topEndNode, 0, 0);
        [].push.apply(ae_column, pilRackRight.GetAllNumbersElements());

        //#endregion
    }

    function CreateRacks() {
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }
        //#region ������� ������

        var trussRacksElArr = []; //������ ��������� �����

        // if(_enableCenterRack){

        //   trussRacksElArr.push(new Beam(_editor,botNodeArr[(botNodeArr.length-1)/2], topNodeArr[(topNodeArr.length-1)/2],1,enableCellJoint));
        // }

        if (_enableRacksBeam) {
            for (var i = 2; i < topNodeArr.length - 1; i += 2) {
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

    /**
     * ���������� ���������� ���� ������� ����� � ��������
     */
    function AngelTruss() {
        var point1 = {
            nodeNum: 1,
            x: _endNode.x,
            y: _endNode.y,
            z: _endNode.z
        };

        var point2 = {
            nodeNum: 2,
            x: _endNode.x,
            y: _endNode.y,
            z: _startNode.z
        };

        var calcPoint = {
            nodeNum: 3,
            x: _startNode.x,
            y: _startNode.y,
            z: _startNode.z
        };

        //���������� �������������� ����
        var coefficientAngle = 1;
        if (_startNode.z > _endNode.z) {
            coefficientAngle = -1;
        }

        var angle = new MathGeometry();
        var returnAngle =
            coefficientAngle * angle.AngelTriangle(point1, point2, calcPoint);
        return returnAngle;
    }
    /**
     * ��������� ���� ��������
     * @returns {number} ������ � ��������� ���� �� ���� �����������
     */
    function AngelCell() {
        var point1 = {
            nodeNum: 1,
            x: _startNode.x,
            y: _startNode.y,
            z: _startNode.z
        };

        var point2 = {
            nodeNum: 2,
            x: _startNode.x + _lenRegion / 2,
            y: _startNode.y,
            z: _startNode.z
        };

        var calcPoint = {
            nodeNum: 3,
            x: _startNode.x,
            y: _startNode.y,
            z: _startNode.z + _hight
        };

        var angle = new MathGeometry();

        return angle.AngelTriangle(point1, point2, calcPoint);
    }

    /**
     * ��������� ����� �����.
     * @returns {number} ����� �����
     */
    function LengthTruss() {
        var x = (_endNode.x - _startNode.x) * (_endNode.x - _startNode.x);
        var y = (_endNode.y - _startNode.y) * (_endNode.y - _startNode.y);
        var z = (_endNode.z - _startNode.z) * (_endNode.z - _startNode.z);

        var lenEl = parseFloat(Math.sqrt(x + y + z)); //����� ����� ��������

        return lenEl;
    }

    /**
     * ��������� ����� ������ �����
     * @returns {number} ����� ������ �����
     */
    function LengthSectionTruss() {
        var x = (_endNode.x - _startNode.x) * (_endNode.x - _startNode.x);
        var y = (_endNode.y - _startNode.y) * (_endNode.y - _startNode.y);
        var z = (_endNode.z - _startNode.z) * (_endNode.z - _startNode.z);

        var lenEl = parseFloat(Math.sqrt(x + y + z)); //����� ����� ��������
        var lenReg = parseFloat(lenEl / _numbSection);

        return lenReg;
    }

    /**
     * ������� ��������� ���� ��� ������� �����
     * @param {object} angle ����
     *
     */
    function CreateStartBottomNode(angle) {
        var angleCell = AngelCell();
        var Rad = ConvertLenghtByAngl(angleCell, _hight);

        var curNode = {
            x: 0,
            y: 0,
            z: 0
        };

        var convert = Math.PI / 180;
        var radian = angle * convert;

        curNode.x = Rad * Math.cos(radian);
        curNode.z = Rad * Math.sin(radian);
        return curNode;
    }
    //#endregion

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
     * @returns {[]} ���������� ������ ������� ��������� ������
     */
    this.GetColumnNumbersElements = function () {
        return ae_column;
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
     * @returns {[]} ���������� ������ ������� ��������� ����������
     */
    this.GetAllNumbersElementsRacksCell = function () {
        return ae_cellPillar;
    };
    /**
     * @returns {number} ���������� ������ ������� ������ (�� ������� �� �������)
     */
    this.GetAllLenghTopBeamReg = function () {
        return parseFloat(lengTopReg);
    };

    /**
     * @returns {[]} ���������� ������ �� ������� �����
     */
    this.GetStartNode = function () {
        return startNodeArr;
    };

    /**
     *
     * @returns {number} ���������� ������ �� ���� ������� ��������� � �����
     */
    this.GetAllElemNumbers = function () {
        var allNumbersElemArr = []; //
        [].push.apply(allNumbersElemArr, cellElNumbArr);
        [].push.apply(allNumbersElemArr, topElNumbArr);
        [].push.apply(allNumbersElemArr, botElNumbArr);
        [].push.apply(allNumbersElemArr, pillarCellElNumbArr);
        [].push.apply(allNumbersElemArr, racksElNumbArr);
        [].push.apply(allNumbersElemArr, pillarRacksArr);
        return allNumbersElemArr;
    };

    /**
     * @returns {number} ���������� ������ ������� ������ (�� ������� �� �������)
     */
    this.GetRegionLengthTopBeam = function () {
        var len = LengthSectionTruss();

        return len;
    };

    this.GetLengthTruss = function () {
        return LengthTruss();
    };

    /**
     * @returns {number} ���������� ������ �����
     */
    this.GetLengthTruss = function () {
        return LengthTruss();
    };

    /**
     * @returns {number} ���������� ���� �������� �����
     */
    this.GetAngleTruss = function () {
        return AngelTruss();
    };

    /**
     * @returns {number} ���������� ������ ����� � �����
     */
    this.GetTrussHeightInPillar = function () {
        var height = 0;

        if (this.elementInfo.column) {
            height = ConvertLenghtByAngl(AngelTruss(), _hight);
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
 * �������� ����� c� ��������� ����� �� ��������:
 			-� ���������� �� �����
			 -� ������ ������� ������������ �����
			 -c ���������� ��������
 * @param {*} editor - ������ �������� ��������
 * @param {object} startNode - ������ ������� ����
 * @param {object} endNode - ������ ������� ���������� ����
 * @param {number} step - ���-�� ���������
 * @param {number} joint - ��������� �������� �� ����� ������: 0 ��� null - ������� ����������;
 * 															  1 - ������� �� Ux � Uy �� 2 ������
 * 															  2 - ������� �� Ux � Uy � ������
 * 														      3 - ������� �� Ux � Uy � �����
 */
    function BeamOffset(editor, startNode, endNode, step, joint) {
        this.elementInfo = {
            id: "b_4",
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
            curElem.ListNode[0] = startNode.nodeNum; //���������� 1 ���� ��� ���������, ��������� ����
            nodeNumberArr.push(startNode);

            var j = 0;
            editor.NodeUpdate(midleNodeNum + j, curNode); //�������� ������ ����
            curElem.ListNode[1] = midleNodeNum + j; //���������� 2 ���� ��� ���������
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
                curElem.ListNode[1] = midleNodeNum + j; //���������� 2 ���� ��� ���������
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
                          lenghtReg, - ����� ���������� �������
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
         * ��������� ����� �������, ����� �����, ������ �������� ��������� � ����������� �� ���������.
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

    function MathGeometry() {
        /**
         * ��������� ����
         * @param {object} point1 ������� 1 (����)
         * @param {object} point2 ������� 2 (����)
         * @param {object} calcPoint ������� ����� �� ��������� ����������� ���� (����)
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
         * ��������� ����� �������, ����� �������� ��������� � ����������� �� ���������.
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

    /**
     * ����������� ����� ����� � ����������� �� �������� ����
     * @param {number} angel
     * @param {number} lineLength
     * @returns  ����� �������������� �����
     */
    function ConvertLenghtByAngl(angel, lineLength) {
        var convert = Math.PI / 180;
        var radian = angel * convert;
        var cosA = Math.cos(radian);

        var lineLen = lineLength / cosA;
        return lineLen;
    }

    //#endregion
}
