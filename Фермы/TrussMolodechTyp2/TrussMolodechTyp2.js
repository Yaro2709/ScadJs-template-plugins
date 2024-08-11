//encoding windows 1251 !!!
//� ����� ����������� ���  ��� ������ �������. ��� ������������� ���������� ��� ����������

/**
 * ������ ��� �������� ����� ������������ �� ����� ���������
 *  �����:
 * -����: ���������
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
 * @param {boolean} enableCenterRack ��������� ����������� ������: true - ��������
 */
function TrussMolodechT2(
    editor,
    startNode,
    endNode,
    numbSection,
    hightStart,
    hightRise,
    enableJoint,
    enableRacksBeam,
    enableCenterRack
) {
    this.elementInfo = {
        id: "t_2",
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
    var _enableCenterRack = enableCenterRack;
    var _topStartNode = null;
    var _topEndNode = null;
    // �������� 
    if (_hightRise < _hightStart) {
        _hightRise = _hightStart;
    }

    var lengTopReg = 0; //����� ������� �������� �����
    var lengTopElem = 0; //����� �������� ����� ���������

    var topNodeArr = []; //������ ����� �������� �����
    var botNodeArr = []; // ������ ����� ������� �����
    var startNodeArr = []; //������ ������� �����

    var trussElArr = []; //������ ��������� ��������
    var trussRacksElArr = []; //������ ��������� �����
    var topElNumbArr = []; //������ ��������� �������� �����
    var botElNumbArr = []; //������ ��������� ������� �����
    var cellElNumbArr = []; //������ ������� ��������� �������
    var pillarCellElNumbArr = []; //������ ������� ��������� ������� ��������
    var racksElNumbArr = []; //������ ������� ��������� �����
    var �olumnElemNumbers = []; //������ ������
    var ae_centerRack = []; //������ ������� ����������� ������

    var trussLen = 0; //����� �����

    //��������� ����
    var hightNode;
    var topNumSection = 0;
    var topLenRegion = 0; //����� ������� � ����������

    /**
     * ������� �����
     */
    this.Create = function () {
        CreateTopBeam();
        CreateBotBeam();
        CreateTrussCell();
        CreateRacks();
    };

    //#region private method

    /**
     * �������� �������� ����� �����
     * @param {object} startNode ��������� ����
     * @param {object} endNode ��������� ����
     * @param {number} hightStart ��������� ������
     * @param {number} hightRise ������ � ������
     * @param {number} numbSection ���������� �������
     * @param {boolean} enableRacksBeam ��������� ������ ����� ��� ���: true - ���������
     * @param {boolean} enableJoint ��������� ���������� �������� �� ���� ������� �����
     */

    function CreateTopBeam() {
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }
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

        trussLen = _topEndNode.x - _topStartNode.x; //����� �����
        hightNode = CreateNode(
            _editor,
            _topStartNode.x + trussLen / 2,
            _topStartNode.y,
            _topStartNode.z + (_hightRise - _hightStart)
        );

        //#region ������� ����

        //��������� ��� ����� ��� �����
        if (_enableRacksBeam) {
            topNumSection = _numbSection * 2;
        } else {
            topNumSection = _numbSection;
        }

        var topBeam = new Beam(
            _editor,
            _topStartNode,
            hightNode,
            topNumSection,
            2
        ); //�����  �����
        var topBeamR = new Beam(
            _editor,
            hightNode,
            _topEndNode,
            topNumSection,
            3
        ); //������  �����
        //���������� ��������
        [].push.apply(topElNumbArr, topBeam.GetAllNumbersElements());
        [].push.apply(topElNumbArr, topBeamR.GetAllNumbersElements());

        if (_enableRacksBeam) {
            topLenRegion = topBeam.GetLengthRegion().lenX * 2; //����� ������� � ����������
        } else {
            topLenRegion = topBeam.GetLengthRegion().lenX; //����� ������� � ����������
        }

        topNodeArr = topBeam.GetAllNodes(); //������ ����� �������� �����
        [].push.apply(topNodeArr, topBeamR.GetAllNodes()); //���������� ����� �������� ����� �� ������ �����
        topNodeArr = UniqArrObjNode(topNodeArr);

        lengTopReg = topBeam.GetLengthRegion().lenghtReg;
        lengTopElem = topBeam.GetLengthRegion().lengthElement;
        //#endregion
    }

    /**
     *
     * @param {object} startNode ��������� ����
     * @param {object} endNode ��������� ����
     */
    function CreateBotBeam() {
        //#region ������ ����

        var bottomBeam = new Beam(
            _editor,
            _startNode,
            _endNode,
            _numbSection * 2 * 2,
            1
        );
        botNodeArr = bottomBeam.GetAllNodes(); //������ ����� ������� �����
        botElNumbArr = bottomBeam.GetAllNumbersElements();

        //�������������� ���� ��� ��������� � ���������� ����� �� �����

        //������� ������
        var pilRackLeft = new Beam(_editor, _startNode, topNodeArr[0], 0, 0);
        [].push.apply(�olumnElemNumbers, pilRackLeft.GetAllNumbersElements());
        var pilRackRight = new Beam(
            _editor,
            _endNode,
            topNodeArr[topNodeArr.length - 1],
            0,
            0
        );
        [].push.apply(�olumnElemNumbers, pilRackRight.GetAllNumbersElements());

        //#endregion
    }

    /**
     * �������� �������� � �����
     * @param {boolean} enableRacksBeam ��������� ������ ����� ��� ���: true - ���������
     * @param {boolean} enableJoint ��������� ���������� �������� �� ���� ������� �����
     */
    function CreateTrussCell() {
        //#region �������
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }

        if (_enableRacksBeam) {
            var j = 1;
            for (var i = 2; i < topNodeArr.length; i += 2) {
                trussElArr.push(
                    new Beam(
                        _editor,
                        topNodeArr[i - 2],
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
        } else {
            var j = 1;
            for (var i = 1; i < topNodeArr.length; i++) {
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
        }
        //���� ������� ���������, �� �������� ������ ������� �� ������� ��������
        if (enableCellJoint == 0) {
            trussElArr[0].SetJoinNumber(2);
            trussElArr[trussElArr.length - 1].SetJoinNumber(3);
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

        //#endregion
    }

    /**
     * �������� ���������� � �����
     * @param {boolean} enableRacksBeam ��������� ������ ����� ��� ���: true - ���������
     * @param {boolean} enableJoint ��������� ���������� �������� �� ���� ������� �����
     */
    function CreateRacks() {
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }

        //#region ������ �����
        if (_enableRacksBeam) {
            for (var i = 1; i < topNodeArr.length; i += 2) {
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

            for (var i = 0; i < trussRacksElArr.length; i++) {
                [].push.apply(
                    racksElNumbArr,
                    trussRacksElArr[i].GetAllNumbersElements()
                );
            }
        }
        //��������� ����������� ������
        if (_enableCenterRack) {
            var centerIndexBotArr = (botNodeArr.length - 1) / 2;
            var centerIndexTopArr = (topNodeArr.length - 1) / 2;
            var centerRack = new Beam(
                _editor,
                botNodeArr[centerIndexBotArr],
                topNodeArr[centerIndexTopArr],
                1,
                enableCellJoint
            );
            ae_centerRack = centerRack.GetAllNumbersElements();
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
        return �olumnElemNumbers;
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
        var c = hightNode.z - _startNode.z;

        var cosA = (a * a + b * b - c * c) / (2 * a * b);
        var radA = Math.acos(cosA);
        var numbAngelA = radA * (180 / Math.PI);

        return numbAngelA;
    };
    /**
     *
     * @returns {number} ���������� ������ �� ���� ������� ��������� � �����
     */
    this.GetAllNumbersElements = function () {
        var allNumbersElemArr = [];
        [].push.apply(allNumbersElemArr, cellElNumbArr);
        [].push.apply(allNumbersElemArr, topElNumbArr);
        [].push.apply(allNumbersElemArr, botElNumbArr);
        [].push.apply(allNumbersElemArr, pillarCellElNumbArr);
        [].push.apply(allNumbersElemArr, racksElNumbArr);
        [].push.apply(allNumbersElemArr, rightColumnElemNumbers);
        [].push.apply(allNumbersElemArr, leftColumnElemNumbers);

        return allNumbersElemArr;
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
