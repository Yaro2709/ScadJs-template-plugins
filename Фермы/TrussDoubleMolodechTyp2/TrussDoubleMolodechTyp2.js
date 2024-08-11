//encoding windows 1251 !!!
//В файле расположены все  для работы функции. Для использования копировать все содержимое

/**
 * Объект для создания фермы. Наклонная
 *  Ферма:
 * -типа: молодечно х2
 * -плоская/ наклонная
 * -Может быть поднята в одном конце
 * -Начальные узлы в нижнем поясе
 * @param {*} editor SCAD
 * @param {object} startNode Стартовый узел
 * @param {object} endNode последний узел
 * @param {number} numbSection количество панелей
 * @param {number} hight высота фермы
 * @param {number} hieghtElevate высота подъема по середине фермы
 * @param {boolean} enableJoint Включение выключение шарниров во всей решетки фермы
 * @param {boolean} enableRacksBeam учитывать стойки фермы или нет: true - учитывать
 * @param {boolean} enableCenterRack Отключить центральную стойку: true - включена
 */
function TrussDoubleMolodechTyp2(
    editor,
    startNode,
    endNode,
    numbSection,
    hight,
    hieghtElevate,
    enableJoint,
    enableRacksBeam,
    enableCenterRack
) {
    this.elementInfo = {
        id: "t_9",
        connect: 11,
        role: "any",
        incline: false,
        column: false
    };

    var _editor = editor;
    var trussHight = hight; //высота фермы
    var _startNode = startNode; //стартовый узел
    var _endNode = endNode; //завершающий узел
    var _numbSection = numbSection; //количество секций в ферме
    var _enableJoint = enableJoint; //Включение выключение шарниров во всей решетки фермы
    var _hieghtElevate = hieghtElevate; //высота подъема по середине фермы
    var _enableRacksBeam = enableRacksBeam; //учитывать стойки фермы или нет: true - учитывать
    var _enableCenterRack = enableCenterRack;

    // Проверка 
    if (trussHight < 0.2) {
        trussHight = 0.2;
    }
    if (_numbSection < 2) {
        _numbSection = 2;
    }
    if (_hieghtElevate < 0) {
        _hieghtElevate = 0;
    }
 

    var _centerTopNode = null; //Коньковый узел верхнего пояса
    var _centerBotNode = null; //Коньковый узел верхнего пояса
 

    var _lenRegion; //длина региона в плоскостях
    var deltaHight;

    var topNodeArr = []; //Массив узлов верхнего пояса
    var botNodeArr = []; // Массив узлов нижнего пояса
    var startNodeArr = [_startNode, _endNode]; //Массив опорных узлов

    var topElNumbArr = []; //Номера элементов верхнего пояса
    var botElNumbArr = []; //Номера элементов нижнего пояса
    var cellElNumbArr = []; //Список номеров элементов раскоса
    var pillarCellElNumbArr = []; //Список номеров элементов опорных раскосов
    var racksElNumbArr = []; //Список номеров элементов Стоек
    var pillarRacksArr = []; //Список номеров Опорные стойки
    var ae_column = []; //Список номеров элементов
    var ae_centerRack = []; //Список номеров Центральной стойки

    this.Create = function () {
        _lenRegion = LengthSectionTruss(); //длина региона в плоскостях
        deltaHight = ConvertLenghtByAngl(AngelTruss(), trussHight);
        CreateTopBeam();

        CreateBotBeam();

        CreateCell();
        CreateRacks();
    };

    //#region private methods
    /**
     * Создание верхнего поряса
     */
    function CreateTopBeam() {
        var centerCoordinateX = _startNode.x + (_endNode.x - _startNode.x) / 2; //Центральная координата по Х
        var centerCoordinateZ = _startNode.z + _hieghtElevate; //Центральная координата по Z

        _centerTopNode = CreateNode(
            _editor,
            centerCoordinateX,
            _startNode.y,
            centerCoordinateZ
        );
        //#region Верхний пояс

        var topNumSection;
        if (_enableRacksBeam) {
            topNumSection = _numbSection * 2;
        } else {
            topNumSection = _numbSection;
        }
        //Левый верхний пояс
        var leftTopBeam = new Beam(
            _editor,
            _startNode,
            _centerTopNode,
            topNumSection,
            2
        ); //Элемент верхнего пояса
        //Заполнение номерами
        [].push.apply(topElNumbArr, leftTopBeam.GetAllNumbersElements());
        topNodeArr = leftTopBeam.GetAllNodes(); //список узлов верхнего пояса

        //Правый верхний пояс
        var rightTopBeam = new Beam(
            _editor,
            _centerTopNode,
            _endNode,
            topNumSection,
            3
        ); //Элемент верхнего пояса

        //Заполнение номерами
        [].push.apply(topElNumbArr, rightTopBeam.GetAllNumbersElements());
        [].push.apply(topNodeArr, rightTopBeam.GetAllNodes()); //список узлов верхнего пояса
        topNodeArr = UniqArrObjNode(topNodeArr);
        //#endregion
    }
    /**
     * Создание нижнего поряса
     */
    function CreateBotBeam() {
        var centerCoordinateX = _startNode.x + (_endNode.x - _startNode.x) / 2; //Центральная координата по Х
        var centerCoordinateZ = _centerTopNode.z - deltaHight; //Центральная координата по Z
        _centerBotNode = CreateNode(
            _editor,
            centerCoordinateX,
            _startNode.y,
            centerCoordinateZ
        );

        var angleCell = AngelCell();

        //#region Левая часть
        var leftCalcLenObjStart = CreateStartBottomNode(
            90 + angleCell + AngelTruss()
        );
        var leftcalcLenObjEnd = CreateStartBottomNode(
            90 + angleCell - AngelTruss()
        );

        var bottomStartNode = CreateNode(
            _editor,
            _startNode.x - leftCalcLenObjStart.x,
            _startNode.y,
            _startNode.z - leftCalcLenObjStart.z
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

        var rightBottomSupBeam = new Beam(
            _editor,
            bottomEndNode,
            _centerBotNode,
            0,
            0
        );

        //Заполнение массивов узлов

        [].push.apply(botNodeArr, bottomBeam.GetAllNodes());
        botNodeArr.push(_centerBotNode);
        //Заполнение массивов номеров элементов

        [].push.apply(botElNumbArr, bottomBeam.GetAllNumbersElements());
        [].push.apply(botElNumbArr, rightBottomSupBeam.GetAllNumbersElements());
        //#endregion

        //#region Правая часть
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
            _endNode.x - rightCalcLenObjEnd.x,
            _endNode.y,
            _endNode.z - rightCalcLenObjEnd.z
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

        //Заполнение массивов узлов

        [].push.apply(botNodeArr, rightBottomBeam.GetAllNodes());

        //Заполнение массивов номеров элементов
        [].push.apply(botElNumbArr, rLeftBottomSupBeam.GetAllNumbersElements());
        [].push.apply(botElNumbArr, rightBottomBeam.GetAllNumbersElements());

        //#endregion
    }
    /**
     * Создание сетки фермы
     */
    function CreateCell() {
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }

        //#region Раскосы
        var trussElArr = []; //Список элементов раскосов
        if (_enableRacksBeam) {
            for (var i = 2; i < topNodeArr.length; i += 2) {
                trussElArr.push(
                    new Beam(
                        _editor,
                        topNodeArr[i - 2],
                        botNodeArr[i - 2],
                        1,
                        enableCellJoint
                    )
                ); //от верха к низу
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[i - 2],
                        topNodeArr[i],
                        1,
                        enableCellJoint
                    )
                ); //от низа к верху
            }
        } else {
            var j = 0;
            for (var i = 1; i < topNodeArr.length; i++) {
                trussElArr.push(
                    new Beam(
                        _editor,
                        topNodeArr[i - 1],
                        botNodeArr[j],
                        1,
                        enableCellJoint
                    )
                ); //от верха к низу
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[j],
                        topNodeArr[i],
                        1,
                        enableCellJoint
                    )
                ); //от низа к верху
                j += 2;
            }
        }

        //Если шарниры отключены, то остаются только шарниры на опорных раскосах

        if (enableCellJoint == 0) {
            trussElArr[0].SetJoinNumber(2);
            trussElArr[trussElArr.length - 1].SetJoinNumber(3);
        }
        //заполнеине номерами элементов раскосов
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
     * Создание стоек фермы
     */
    function CreateRacks() {
        //#region Стойки фермы
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }

        var trussRacksElArr = []; //Список элементов стоек
        if (_enableRacksBeam) {
            var j = 0;
            for (var i = 1; i < topNodeArr.length; i += 2) {
                trussRacksElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[j],
                        topNodeArr[i],
                        1,
                        enableCellJoint
                    )
                ); //от низа к верху
                j += 2;
            }
        }

        for (var i = 0; i < trussRacksElArr.length; i++) {
            [].push.apply(
                racksElNumbArr,
                trussRacksElArr[i].GetAllNumbersElements()
            );
        }
        //Включение центральной стойки
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

    /**
     * Вычесляет длину фермы.
     * @returns {number} Длина фермы
     */
    function LengthTruss() {
        var x = (_endNode.x - _startNode.x) * (_endNode.x - _startNode.x);
        var y = (_endNode.y - _startNode.y) * (_endNode.y - _startNode.y);
        var z = (_endNode.z - _startNode.z) * (_endNode.z - _startNode.z);

        var lenEl = parseFloat(Math.sqrt(x + y + z)); //общая длина элемента

        return lenEl;
    }

    /**
     * Вычисляет длину панели фермы
     * @returns {number} Длина секции фермы
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

        var lenEl = parseFloat(Math.sqrt(x + y + z)); //общая длина элемента
        var lenReg = parseFloat(lenEl / _numbSection);

        return lenReg;
    }
    /**
     * Возвращает значениями угла наклона верхнего пояса фермы в градусах
     * @param {object} startNode Стартовый узел
     * @param {object} endNode последний узел
     */
    function AngelTruss() {
        //Центральная вверхняя
        var point1 = {
            nodeNum: 1,
            x: _startNode.x + (_endNode.x - _startNode.x) / 2,
            y: _startNode.y,
            z: _startNode.z + _hieghtElevate
        };

        //Центральная нижняя
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
     * Вычислить угол раскосов
     */
    function AngelCell() {
        var point1 = {
            nodeNum: 1,
            x: _startNode.x,
            y: _startNode.y,
            z: _startNode.z - trussHight
        };

        var point2 = {
            nodeNum: 2,
            x: _startNode.x + _lenRegion / 2,
            y: _startNode.y,
            z: _startNode.z - trussHight
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
     * Создает стартовые узлы для нижнего пояса
     * @param {object} angle угол
     *
     */
    function CreateStartBottomNode(angle) {
        var angleCell = AngelCell();
        var Rad = ConvertLenghtByAngl(angleCell, trussHight);

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
     * @returns {[]} Возвращает список опорных узлов [startNode, endNode]
     */
    this.GetSupportNode = function () {
        return startNodeArr;
    };
    /**
     * @returns {[]} Возвращает список всех узлов верхнего пояса
     */
    this.GetAllNodesTop = function () {
        return topNodeArr;
    };

    /**
     * @returns {[]} Возвращает список всех узлов нижнего пояса
     */
    this.GetAllNodesBottom = function () {
        return botNodeArr;
    };

    /**
     * @returns {[]} Возвращает список узлов для присоединения справа
     */
    this.GetRightConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(topNodeArr[topNodeArr.length - 1]);
        return connectionNodesArr;
    };
    /**
     * @returns {[]} Возвращает список узлов для присоединения слева
     */
    this.GetLeftConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(topNodeArr[0]);
        return connectionNodesArr;
    };
    /**
     * @returns {[]} Возвращает список номеров элементов колонн
     */
    this.GetColumnNumbersElements = function () {
        return ae_column;
    };

    /**
     * @returns {[]} Возвращает список номеров элементов верхнего пояса
     */
    this.GetAllNumbersElementsTop = function () {
        return topElNumbArr;
    };

    /**
     * @returns {[]} Возвращает список номеров элементов нижнего пояса
     */
    this.GetAllNumbersElementsBot = function () {
        return botElNumbArr;
    };

    /**
     * @returns {[]} Возвращает список номеров элементов раскосов
     */
    this.GetAllNumbersElementsCell = function () {
        return cellElNumbArr;
    };

    /**
     * @returns {[]} Возвращает список номеров элементов опорных стоек
     */
    this.GetAllNumbersElementsPillarRacks = function () {
        return pillarRacksArr;
    };

    /**
     * @returns {[]} Возвращает список номеров элементов стоек
     */
    this.GetAllNumbersElementsRacks = function () {
        return racksElNumbArr;
    };

    /**
     * @returns {[]} Возвращает список номеров элементов центральной стойки
     */
    this.GetNumberElementsCenterRack = function () {
        return ae_centerRack;
    };

    /**
     * @returns {[]} Возвращает список номеров элементов опорных раскосов
     */
    this.GetAllNumbersElementsPillarCell = function () {
        return pillarCellElNumbArr;
    };

    /**
     * @returns {number} Возвращает дилину участка панели (от прогона до прогона)
     */
    this.GetRegionLengthTopBeam = function () {
        var len = LengthSectionTruss();
        if (_enableRacksBeam) {
            len = LengthSectionTruss() / 2;
        }
        return len;
    };

    /**
     * @returns {number} Возвращает дилину фермы
     */
    this.GetLengthTruss = function () {
        return LengthTruss();
    };

    /**
     * @returns {number} Возвращает угол наклонна фермы
     */
    this.GetAngleTruss = function () {
        return AngelTruss();
    };

    /**
     *
     * @returns {number} Возвращает массив из всех номеров элементов в ферме
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
     * @returns {number} Возвращает высоту фермы в опоре
     */
    this.GetTrussHeightInPillar = function () {
        var height = 0;

        if (this.elementInfo.column) {
            height = ConvertLenghtByAngl(AngelTruss(), trussHight);
        }

        return height;
    };

    //#region Support Functions

    /**
     * Создание балки:
                -с разбиением на части
                -с учетом разного расположения узлов
                -c включением шарниров
    * @param {*} editor - SCAD параметр
    * @param {object} startNode - Объект первого узла
    * @param {object} endNode - Объект первого последнего узла
    * @param {number} step - Кол-во разбиений
    * @param {number} joint - Включение шарниров по обеим концам: 0 или null - жесткое соединение;
    * 															  1 - шарниры по Ux и Uy по 2 концам
    * 															  2 - шарниры по Ux и Uy в начале
    * 														      3 - шарниры по Ux и Uy в конце
    */
    function Beam(editor, startNode, endNode, step, joint) {
        this.elementInfo = {
            id: "b_1",
            connect: 11
        };

        var elemNumberArr = []; //список номеров элементов
        var nodeNumberArr = []; //список объектов узлов
        var centerNodeObjArr = []; //список центральных объектов узлов
        this.joint = joint;
        //#region проверка
        if (step <= 0) {
            step = 1;
        }

        if (joint > 3 || joint < 0) {
            joint = 1;
        }

        //#endregion

        //#region Элементы
        var eQ = step; //кол-во элементов
        var baseElemNum = editor.ElemAdd(eQ); // ввод нового элемента в программу, номер первого элемента
        var eI = baseElemNum; // номер первого элемента

        var curElem = { TypeElem: 5, ListNode: [0, 0] }; //Содержит объекты - Тип элемента 5, список узлов[start, end]
        var Joint = { Mask: 48, Place: 1 }; //Объект для задания шарниров
        //#endregion

        //#region Узлы
        //Если появляются средние пролеты то добавляются новые узлы
        if (step > 1) {
            var nQ = step - 1; //количество узлов
            var midleNodeNum = editor.NodeAdd(nQ); //Номер первого узла

            //Определение длины участков по всем координатам через объект
            var objLenCoor = LenghtRegion(startNode, endNode, step);

            var curNode = {
                x: startNode.x + objLenCoor.lenX,
                y: startNode.y + objLenCoor.lenY,
                z: startNode.z + objLenCoor.lenZ
            };
            //#region Создание
            curElem.ListNode[0] = startNode.nodeNum; //назначение 1 узла для элемента, стартовый узел
            nodeNumberArr.push(startNode);

            for (var i = 0; i < nQ; i++) {
                editor.NodeUpdate(midleNodeNum + i, curNode); //создание нового узла
                curElem.ListNode[1] = midleNodeNum + i; //назначение 2 узла для элемента
                editor.ElemUpdate(eI + i, curElem); //создание элемента

                //добавление выходной информации
                elemNumberArr.push(eI + i);

                //Объект для записи узлов
                var nodeObj = {
                    nodeNum: midleNodeNum + i,
                    x: curNode.x,
                    y: curNode.y,
                    z: curNode.z
                };

                nodeNumberArr.push(nodeObj); //запись узла в список
                centerNodeObjArr.push(nodeObj); //запись узла в список

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

            //#region Назначение шарниров
            //по 2 концам
            if (this.joint == 1) {
                editor.JointSet(eI, 1, Joint); //первый элемент
                editor.JointSet(eI + nQ, 2, Joint); //последний элемент
            }
            //Шарнир в начале
            if (this.joint == 2) {
                editor.JointSet(eI, 1, Joint); //первый элемент
            }
            //Шарнир в конце
            if (this.joint == 3) {
                editor.JointSet(eI + nQ, 2, Joint); //последний элемент
            }
            //#endregion
        } else {
            curElem.ListNode[0] = startNode.nodeNum;
            curElem.ListNode[1] = endNode.nodeNum;
            editor.ElemUpdate(eI, curElem); //создание элемента

            elemNumberArr.push(eI);
            nodeNumberArr.push(startNode);
            nodeNumberArr.push(endNode);

            //#region Назначение шарниров по 2 концам
            if (this.joint == 1) {
                editor.JointSet(eI, 1, Joint);
                editor.JointSet(eI, 2, Joint);
            } else if (this.joint == 2) {
                editor.JointSet(eI, 1, Joint); //первый элемент
            } else if (this.joint == 3) {
                editor.JointSet(eI, 2, Joint); //последний элемент
            }

            //#endregion
        }
        //#endregion

        /**
         * @returns {number} Возвращает номер последнего элемента
         */
        this.GetLastElemNumber = function () {
            return elemNumberArr[elemNumberArr.length - 1];
        };

        /**
         * @returns {Array} Возвращает список всех узлов в виде объектов
         */
        this.GetAllNodes = function () {
            return nodeNumberArr;
        };

        /**
         * @returns {Array} Возвращает список всех номеров элементов
         */
        this.GetAllNumbersElements = function () {
            return elemNumberArr;
        };

        /**
         * @returns Возвращает центральные узлы колонны. Если они не созданы возвращает null
         */
        this.GetCenterNodes = function () {
            if (centerNodeObjArr == null) {
                return null;
            }
            return centerNodeObjArr;
        };

        /**
         * 
         * @returns {object} Объект с проекциеи длин по всем координатам {
                 lenX,- проекция на ось Х
                lenY, - проекция на ось Y
                lenZ, - проекция на ось Z
                lenghtReg, - Длина разбитого региона
                lengthElement - общая длина элемента}
        */
        this.GetLengthRegion = function () {
            return objLenCoor;
        };

        /**
         * Задает занчение номера вида шарнира
         * @param {number} numbJoint - номер соединения: 0 или null - жесткое соединение;
         * 															  1 - шарниры по Ux и Uy по 2 концам;
         * 															  2 - шарниры по Ux и Uy в начале;
         * 														      3 - шарниры по Ux и Uy в конце;
         */
        this.SetJoinNumber = function (numbJoint) {
            if (numbJoint == 1) {
                editor.JointSet(eI, 1, Joint);
                editor.JointSet(eI, 2, Joint);
            } else if (numbJoint == 2) {
                editor.JointSet(eI, 1, Joint); //первый элемент
            } else if (numbJoint == 3) {
                editor.JointSet(eI, 2, Joint); //последний элемент
            }
        };
        /**
         * Вычисляет длину региона, длину, длины проекций разбиения в зависимости от координат.
         * @param {object} endPoint - Объект первого узла
         * @param {object} startPoint - Объект последнего узла
         * @param {number} step - Кол-во разбиений
         * @returns {object} Объект с проекциеи длин по всем координатам
         */
        function LenghtRegion(startPoint, endPoint, step) {
            var x = (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x);
            var y = (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y);
            var z = (endPoint.z - startPoint.z) * (endPoint.z - startPoint.z);

            var lenEl = parseFloat(Math.sqrt(x + y + z)); //общая длина элемента
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
     * Создает узел в указанных координатах
     * @param {*} editor Параметр SCAD
     * @param {number} x Координата Х
     * @param {number} y Координата У
     * @param {number} z Координата Z
     * @returns  Объект узла - 
            {nodeNum:baseNodeNum,
            x:curNode.x,
            y:curNode.y,
            z:curNode.z}
        */
    function CreateNode(editor, x, y, z) {
        var nQ = 1;
        var baseNodeNum = editor.NodeAdd(nQ); //Номер первого узла
        var curNode = { x: x, y: y, z: z };
        editor.NodeUpdate(baseNodeNum, curNode); //Создание узла в схеме
        //Объект узла
        var nodeObj = {
            nodeNum: baseNodeNum,
            x: curNode.x,
            y: curNode.y,
            z: curNode.z
        };

        return nodeObj;
    }

    /**
     * Функция вычисляет уникальные узлы массива состоящих из объектов
     * и убирает совпадающие элементы с сохранением порядка в массиве
     * @param {[]} arr - массив элементов
     * @returns {[]} массив уникальных элементов
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
         * Вычисляет угол
         * @param {object} point1 Вершина 1 (узел)
         * @param {object} point2 Вершина 2 (узел)
         * @param {object} calcPoint Вершина между ее сторонами вычисляется угол (узел)
         * @returns {number} Угол в градусах
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
         * Вычисляет длину региона, длины проекций разбиения в зависимости от координат.
         * @param {object} endPoint - Объект первого узла
         * @param {object} startPoint - Объект последнего узла
         * @returns {number} Длина между точками
         */
        this.LenghtRegion = function (startPoint, endPoint) {
            var x = (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x);
            var y = (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y);
            var z = (endPoint.z - startPoint.z) * (endPoint.z - startPoint.z);

            var lenEl = parseFloat(Math.sqrt(x + y + z)); //общая длина элемента

            return lenEl;
        };
    }

    /**
     * Увеличивает длину линии в зависимости от косинуса угла
     * @param {number} angel
     * @param {number} lineLength
     * @returns  Длина конвертируемой линии
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
