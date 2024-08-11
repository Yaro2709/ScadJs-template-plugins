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
 * @param {number} numbSection ���������� �������
 * @param {number} hight ������ �����
 * @param {number} hieghtElevate ������ ������� �� �������� �����
 * @param {boolean} enableJoint ��������� ���������� �������� �� ���� ������� �����
 * @param {boolean} enableRacksBeam ��������� ������ ����� ��� ���: true - ���������
 * @param {boolean} enableCenterRack ��������� ����������� ������: true - ��������
 * @param {boolean} enableCellPillar ������� ���������: true - �������
 */
function TrussDoubleMolodechTyp3(
    editor,
    startNode,
    endNode,
    numbSection,
    hight,
    hieghtElevate,
    enableJoint,
    enableRacksBeam,
    enableCenterRack,
    enableCellPillar
) {
    this.elementInfo = {
        id: "t_10",
        connect: 11,
        role: "center",
        incline: false,
        column: true
    };
    var _editor = editor;
    var _startNode = startNode;
    var _endNode = endNode;

    var _centerTopNode = null; //��������� ���� �������� �����
    var _centerBotNode = null; //��������� ���� �������� �����
    var _topStartNode = null;
    var _topEndNode = null;

    var _numbSection = numbSection;
    var _hight = hight;
    var _hieghtElevate = hieghtElevate;
    var _enableJoint = enableJoint;
    var _enableCellPillar = enableCellPillar;
    var _enableRacksBeam = enableRacksBeam; //��������� ������ ����� ��� ���: true - ���������
    var _enableCenterRack = enableCenterRack;

    // �������� 
    if (_hight < 0.2) {
        _hight = 0.2;
    }
    if (_numbSection < 2) {
        _numbSection = 2;
    }
    if (_hieghtElevate < 0) {
        _hieghtElevate = 0;
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
    var ae_cellPillar = []; //������ ��������� ����������
    var ae_centerRack = []; //������ ������� ����������� ������
    var ae_column = []; //������ ������� ���������

    var _lenRegion; //����� ������� � ����������

    /**
     * ������� �����
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

        var centerCoordinateX = _startNode.x + (_endNode.x - _startNode.x) / 2; //����������� ���������� �� �
        var centerCoordinateZ = _startNode.z + deltaHight + _hieghtElevate; //����������� ���������� �� Z

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

        _centerTopNode = CreateNode(
            _editor,
            centerCoordinateX,
            _startNode.y,
            centerCoordinateZ
        );
        var topBeam;
        var topBeamR;
        var topNumSection = 0;
        if (_enableRacksBeam) {
            topNumSection = _numbSection * 2;
            topBeam = new Beam(
                _editor,
                _topStartNode,
                _centerTopNode,
                topNumSection,
                2
            ); //�����  �����
            topBeamR = new Beam(
                _editor,
                _centerTopNode,
                _topEndNode,
                topNumSection,
                3
            ); //������  �����
            topNodeArr = topBeam.GetAllNodes(); //������ ����� �������� �����
            [].push.apply(topNodeArr, topBeamR.GetAllNodes()); //���������� ����� �������� ����� �� ������ �����
            topNodeArr = UniqArrObjNode(topNodeArr);
        } else {
            topNumSection = _numbSection;
            topBeam = new BeamOffset(
                _editor,
                _topStartNode,
                _centerTopNode,
                topNumSection,
                2
            ); //�����  �����
            topBeamR = new BeamOffset(
                _editor,
                _centerTopNode,
                _topEndNode,
                topNumSection,
                3
            ); //������  �����
            topNodeArr = topBeam.GetAllNodes(); //������ ����� �������� �����
            [].push.apply(topNodeArr, topBeamR.GetAllNodes()); //���������� ����� �������� ����� �� ������ �����
            topNodeArr = UniqArrObjNode(topNodeArr);
        }
        //���������� ��������
        [].push.apply(topElNumbArr, topBeam.GetAllNumbersElements());
        [].push.apply(topElNumbArr, topBeamR.GetAllNumbersElements());

        lengTopReg = topBeam.GetLengthRegion().lenghtReg;

        //#endregion
    }
    /**
     * �������� ������� ����� �����
     */
    function CreateBotBeam() {
        var centerCoordinateX = _startNode.x + (_endNode.x - _startNode.x) / 2; //����������� ���������� �� �
        var centerCoordinateZ = _startNode.z + _hieghtElevate; //����������� ���������� �� Z
        _centerBotNode = CreateNode(
            _editor,
            centerCoordinateX,
            _startNode.y,
            centerCoordinateZ
        );

        var angleCell = AngelCell();

        //#region ����� �����
        var leftCalcLenObjStart = CreateStartBottomNode(
            90 + angleCell + AngelTruss()
        );
        var leftcalcLenObjEnd = CreateStartBottomNode(
            90 + angleCell - AngelTruss()
        );

        var bottomStartNode = CreateNode(
            _editor,
            _topStartNode.x - leftCalcLenObjStart.x,
            _topStartNode.y,
            _topStartNode.z - leftCalcLenObjStart.z
        );
        var bottomEndNode = CreateNode(
            _editor,
            _centerTopNode.x + leftcalcLenObjEnd.x,
            _centerTopNode.y,
            _centerTopNode.z - leftcalcLenObjEnd.z
        );

        var bottomBeam = new Beam(
            _editor,
            bottomStartNode,
            bottomEndNode,
            _numbSection * 2 - 2,
            0
        );

        var leftBottomSupBeam = new Beam(
            _editor,
            _startNode,
            bottomStartNode,
            0,
            2
        );
        var rightBottomSupBeam = new Beam(
            _editor,
            bottomEndNode,
            _centerBotNode,
            0,
            0
        );

        //���������� �������� �����
        botNodeArr.push(_startNode);
        [].push.apply(botNodeArr, bottomBeam.GetAllNodes());
        botNodeArr.push(_centerBotNode);
        //���������� �������� ������� ���������
        [].push.apply(botElNumbArr, leftBottomSupBeam.GetAllNumbersElements());
        [].push.apply(botElNumbArr, bottomBeam.GetAllNumbersElements());
        [].push.apply(botElNumbArr, rightBottomSupBeam.GetAllNumbersElements());
        //#endregion

        //#region ������ �����
        var rightCalcLenObjStart = CreateStartBottomNode(
            90 - angleCell + AngelTruss()
        );
        var rightCalcLenObjEnd = CreateStartBottomNode(
            90 - angleCell - AngelTruss()
        );

        var rightBottomStartNode = CreateNode(
            _editor,
            _centerTopNode.x + rightCalcLenObjStart.x,
            _centerTopNode.y,
            _centerTopNode.z - rightCalcLenObjStart.z
        );
        var rightBottomEndNode = CreateNode(
            _editor,
            _topEndNode.x - rightCalcLenObjEnd.x,
            _topEndNode.y,
            _topEndNode.z - rightCalcLenObjEnd.z
        );

        var rightBottomBeam = new Beam(
            _editor,
            rightBottomStartNode,
            rightBottomEndNode,
            _numbSection * 2 - 2,
            0
        );

        var rLeftBottomSupBeam = new Beam(
            _editor,
            _centerBotNode,
            rightBottomStartNode,
            0,
            0
        );
        var rRightBottomSupBeam = new Beam(
            _editor,
            rightBottomEndNode,
            _endNode,
            0,
            3
        );

        //���������� �������� �����

        [].push.apply(botNodeArr, rightBottomBeam.GetAllNodes());
        botNodeArr.push(_endNode);
        //���������� �������� ������� ���������
        [].push.apply(botElNumbArr, rLeftBottomSupBeam.GetAllNumbersElements());
        [].push.apply(botElNumbArr, rightBottomBeam.GetAllNumbersElements());
        [].push.apply(
            botElNumbArr,
            rRightBottomSupBeam.GetAllNumbersElements()
        );
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
        var trussElArr = []; //������ ��������� ��������
        var cellPillarElArr = []; //������ ��������� ����������
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
                if (i == (topNodeArr.length - 1) / 2) {
                    i++;
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
                    continue;
                }
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
        //#endregion
    }

    function CreateSupportColumn() {
        //#region ������� ������

        var pilRackLeft = new Beam(_editor, _startNode, _topStartNode, 0, 0);
        [].push.apply(ae_column, pilRackLeft.GetAllNumbersElements());
        var pilRackRight = new Beam(_editor, _endNode, _topEndNode, 0, 0);
        [].push.apply(ae_column, pilRackRight.GetAllNumbersElements());

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
        if (_enableCenterRack && !_enableRacksBeam) {
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

    /**
     * ���������� ���������� ���� ������� ����� � ��������
     */
    function AngelTruss() {
        var point1 = {
            nodeNum: 1,
            x: _startNode.x + (_endNode.x - _startNode.x) / 2,
            y: _startNode.y,
            z: _startNode.z + _hieghtElevate
        };

        //����������� ������
        var point2 = {
            nodeNum: 2,
            x: _startNode.x + (_endNode.x - _startNode.x) / 2,
            y: _startNode.y,
            z: _startNode.z
        };

        var calcPoint = {
            nodeNum: 3,
            x: _startNode.x,
            y: _startNode.y,
            z: _startNode.z
        };

        var angle = new MathGeometry();

        return angle.AngelTriangle(point1, point2, calcPoint);
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
        var centerTopNode = {
            x: _startNode.x + (_endNode.x - _startNode.x) / 2,
            y: _startNode.y,
            z: _startNode.z + _hieghtElevate
        };

        var x =
            (centerTopNode.x - _startNode.x) * (centerTopNode.x - _startNode.x);
        var y =
            (centerTopNode.y - _startNode.y) * (centerTopNode.y - _startNode.y);
        var z =
            (centerTopNode.z - _startNode.z) * (centerTopNode.z - _startNode.z);

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
     * @returns {[]} ���������� ������ ������� ��������� ����������� ������
     */
    this.GetNumberElementsCenterRack = function () {
        return ae_centerRack;
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
                //  * ������ �������� ������ ���� �������
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
         * ��������� ����� �������,  ����� �������� ��������� � ����������� �� ���������.
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
