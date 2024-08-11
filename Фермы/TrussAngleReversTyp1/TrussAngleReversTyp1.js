//encoding windows 1251 !!!
//В файле расположены все  для работы функции. Для использования копировать все содержимое

/**
 * Объект для создания фермы. Наклонная
 *   Ферма:
 * -типа: молодечная c повернутой сеткой
 * -плоская
 * -Может быть поднята в одном конце
 * @param {*} editor SCAD
 * @param {object} startNode Стартовый узел
 * @param {object} endNode последний узел
 * @param {number} numbSection количество панелей, мин. = 2 шт
 * @param {number} hight высота фермы
 * @param {boolean} enableJoint Включение выключение шарниров во всей решетки фермы
 * @param {boolean} enableRacksBeam учитывать стойки фермы или нет: true - учитывать
 * @param {boolean} enableCellPillar создать шпренгель: true - создать
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

    // Проверка
    if (_hight < 0.2) {
        _hight = 0.2;
    }

    if (_numbSection < 2) {
        _numbSection = 2;
    }

    var lengTopReg = 0; //Длина региона верхнего пояса
    var lengTopElem = 0; //Длина верхнего пояса полуфермы

    var topNodeArr = []; //Массив узлов верхнего пояса
    var botNodeArr = []; // Массив узлов нижнего пояса
    var startNodeArr = []; //Массив опорных узлов

    var trussRacksElArr = []; //Список элементов стоек
    var topElNumbArr = []; //Номера элементов верхнего пояса
    var botElNumbArr = []; //Номера элементов нижнего пояса
    var cellElNumbArr = []; //Список номеров элементов раскоса
    var pillarCellElNumbArr = []; //Список номеров элементов опорных раскосов
    var racksElNumbArr = []; //Список номеров элементов Стоек
    var pillarRacksArr = []; //Список номеров Опорные стойки
    var ae_column = []; //Список колонн
    var ae_cellPillar = []; //Список элементов Шпренгелей

    var trussLen = 0; //длина фермы

    var trussHight = 0; //высота фермы
    //Коньковый узел
    var hightNode;
    var topNumSection = 0;
    var topLenRegion = 0; //длина региона в плоскостях
    var _lenRegion; //длина региона в плоскостях

    /**
     * Создание фермы
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
     * Создание верхнего пояса фермы
     */
    function CreateTopBeam() {
        //#region Верхний пояс
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
            ); //Элемент верхнего вояса
        } else {
            topNumSection = _numbSection;
            topBeam = new BeamOffset(
                _editor,
                _topStartNode,
                _topEndNode,
                topNumSection,
                1
            ); //Элемент верхнего вояса
        }
        //Заполнение номерами
        [].push.apply(topElNumbArr, topBeam.GetAllNumbersElements());
        //заполнение инфы длины региона

        topLenRegion = topBeam.GetLengthRegion().lenghtReg; //длина региона в плоскостях

        topNodeArr = topBeam.GetAllNodes(); //список узлов верхнего пояса

        lengTopReg = topBeam.GetLengthRegion().lenghtReg;
        lengTopElem = topBeam.GetLengthRegion().lengthElement;
        //#endregion
    }
    /**
     * Создание нижнего пояса фермы
     */
    function CreateBotBeam() {
        //#region нижний пояс

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
        botNodeArr = bottomBeam.GetAllNodes(); //список узлов нижнего пояса
        botNodeArr.unshift(_startNode);
        botNodeArr.push(_endNode);
        botElNumbArr = bottomBeam.GetAllNumbersElements();

        //дополнительные узлы для ключения и выключения балок по краям

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
     * Создание сетки фермы
     */
    function CreateCell() {
        //#region Раскосы
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }
        var cellPillarElArr = []; //Список элементов шпренгелей
        var trussElArr = []; //Список элементов расскосов
        //Опорный раскос левый
        if (_enableRacksBeam) {
            //Опорный раскос левый
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
                //Шпренгель
                cellPillarElArr.push(
                    new Beam(
                        _editor,
                        trussElArr[trussElArr.length - 1].GetCenterNodes()[0],
                        topNodeArr[0],
                        1,
                        enableCellJoint
                    )
                ); //перпендикулярный раскос
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
            //Сердняя часть
            for (var i = 3; i < topNodeArr.length; i += 2) {
                trussElArr.push(
                    new Beam(
                        _editor,
                        topNodeArr[i - 2],
                        botNodeArr[i - 1],
                        1,
                        enableCellJoint
                    )
                ); //от верха к низу
                trussElArr.push(
                    new Beam(
                        _editor,
                        botNodeArr[i - 1],
                        topNodeArr[i],
                        1,
                        enableCellJoint
                    )
                ); //от низа к верху
            }

            // Опорный раскос правый
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
                //Шпренгель
                cellPillarElArr.push(
                    new Beam(
                        _editor,
                        trussElArr[trussElArr.length - 1].GetCenterNodes()[0],
                        topNodeArr[topNodeArr.length - 1],
                        1,
                        enableCellJoint
                    )
                ); //перпендикулярный раскос
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
                ); //перпендикулярный раскос
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
            //Сердняя часть
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
            // Опорный раскос правый
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
                ); //перпендикулярный раскос
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

        //Если шарниры отключены, то остаются только шарниры на опорных раскосах
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
        //заполнеине номерами элементов шпренгелей
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
     * Создает колонны
     */
    function CreateSupportColumn() {
        //#region Опорные стойки

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
        //#region Опорные стойки

        var trussRacksElArr = []; //Список элементов стоек

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
                ); //от низа к верху
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
     * Возвращяет значениями угла наклона фермы в градусах
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

        //Коэффицент преоброзования угла
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
     * Вычеслить угол раскосов
     * @returns {number} Объект с проекцими длин по всем координатам
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
     * Вычесляет длину панели фермы
     * @returns {number} Длина секции фермы
     */
    function LengthSectionTruss() {
        var x = (_endNode.x - _startNode.x) * (_endNode.x - _startNode.x);
        var y = (_endNode.y - _startNode.y) * (_endNode.y - _startNode.y);
        var z = (_endNode.z - _startNode.z) * (_endNode.z - _startNode.z);

        var lenEl = parseFloat(Math.sqrt(x + y + z)); //общая длина элемента
        var lenReg = parseFloat(lenEl / _numbSection);

        return lenReg;
    }

    /**
     * Создает стартовые узлы для нижнего пояса
     * @param {object} angle угол
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
     * @returns {[]} Возвращяет список всех узлов верънего пояса
     */
    this.GetAllNodesTop = function () {
        return topNodeArr;
    };

    /**
     * @returns {[]} Возвращяет список всех узлов нижнего пояса
     */
    this.GetAllNodesBottom = function () {
        return botNodeArr;
    };
    /**
     * @returns {[]} Возвращяет список узлов для присоединения справа
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
     * @returns {[]} Возвращяет список узлов для присоединения слева
     */
    this.GetLeftConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(botNodeArr[0], topNodeArr[0]);
        return connectionNodesArr;
    };
    /**
     * @returns {[]} Возвращяет список номеров элементов верхнего пояса
     */
    this.GetAllNumbersElementsTop = function () {
        return topElNumbArr;
    };

    /**
     * @returns {[]} Возвращяет список номеров элементов нижнего пояса
     */
    this.GetAllNumbersElementsBot = function () {
        return botElNumbArr;
    };

    /**
     * @returns {[]} Возвращяет список номеров элементов раскосов
     */
    this.GetAllNumbersElementsCell = function () {
        return cellElNumbArr;
    };

    /**
     * @returns {[]} Возвращяет список номеров элементов колонн
     */
    this.GetColumnNumbersElements = function () {
        return ae_column;
    };

    /**
     * @returns {[]} Возвращяет список номеров элементов стоек
     */
    this.GetAllNumbersElementsRacks = function () {
        return racksElNumbArr;
    };

    /**
     * @returns {[]} Возвращяет список номеров элементов опорных раскосов
     */
    this.GetAllNumbersElementsPillarCell = function () {
        return pillarCellElNumbArr;
    };

    /**
     * @returns {[]} Возвращяет список номеров элементов шпренгелей
     */
    this.GetAllNumbersElementsRacksCell = function () {
        return ae_cellPillar;
    };
    /**
     * @returns {number} Возвращяет дилину участка панели (от прогона до прогона)
     */
    this.GetAllLenghTopBeamReg = function () {
        return parseFloat(lengTopReg);
    };

    /**
     * @returns {[]} Возвращяет массив из опорных узлов
     */
    this.GetStartNode = function () {
        return startNodeArr;
    };

    /**
     *
     * @returns {number} Возвращяет массив из всех номеров елементов в ферме
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
     * @returns {number} Возвращяет дилину участка панели (от прогона до прогона)
     */
    this.GetRegionLengthTopBeam = function () {
        var len = LengthSectionTruss();

        return len;
    };

    this.GetLengthTruss = function () {
        return LengthTruss();
    };

    /**
     * @returns {number} Возвращяет дилину фермы
     */
    this.GetLengthTruss = function () {
        return LengthTruss();
    };

    /**
     * @returns {number} Возвращяет угол наклонна фермы
     */
    this.GetAngleTruss = function () {
        return AngelTruss();
    };

    /**
     * @returns {number} Возвращяет высоту фермы в опоре
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
         * @param {object} startPoint - Объект послетнего узла
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
 * Создание балки cо смещением узлов на половину:
 			-с разбиением на части
			 -с учетом разного расположения узлов
			 -c включением шарниров
 * @param {*} editor - Основы параметр создания
 * @param {object} startNode - Объект первого узла
 * @param {object} endNode - Объект первого последнего узла
 * @param {number} step - Кол-во разбиений
 * @param {number} joint - Включение шарниров по обеим концам: 0 или null - жесткое соединение;
 * 															  1 - шарниры по Ux и Uy по 2 концам
 * 															  2 - шарниры по Ux и Uy в начале
 * 														      3 - шарниры по Ux и Uy в конце
 */
    function BeamOffset(editor, startNode, endNode, step, joint) {
        this.elementInfo = {
            id: "b_4",
            connect: 11
        };

        var elemNumberArr = []; //список номеров елементов
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

        var curElem = { TypeElem: 5, ListNode: [0, 0] }; //Содержит объекты - Тип элемента 5, список узлов[start, end]
        var Joint = { Mask: 48, Place: 1 }; //Объект для задания шарниров
        //#endregion

        //#region Узлы
        //Если появляются средние пролеты то добовляются новые узлы
        if (step > 1) {
            var eQ = step + 1; //кол-во элементов
            var baseElemNum = editor.ElemAdd(eQ); // ввод нового элемента в программу, номер первого элемента
            var eI = baseElemNum; // номер первого элемента
            var nQ = step; //количество узлов
            var midleNodeNum = editor.NodeAdd(nQ); //Номер первого узла

            //Определение длины участков по всем координатам через объект
            var objLenCoor = LenghtRegion(startNode, endNode, step);

            var curNode = {
                x: startNode.x + objLenCoor.lenX / 2,
                y: startNode.y + objLenCoor.lenY / 2,
                z: startNode.z + objLenCoor.lenZ / 2
            };
            //#region Создание
            curElem.ListNode[0] = startNode.nodeNum; //назначение 1 узла для элементра, стартовый узел
            nodeNumberArr.push(startNode);

            var j = 0;
            editor.NodeUpdate(midleNodeNum + j, curNode); //создание нового узла
            curElem.ListNode[1] = midleNodeNum + j; //назначение 2 узла для элементра
            editor.ElemUpdate(eI + j, curElem); //создание элемента

            for (var i = 0; i < nQ - 1; i++) {
                //добавление выходной информации
                elemNumberArr.push(eI + j);

                //Объект для записи узлов
                var nodeObj = {
                    nodeNum: midleNodeNum + j,
                    x: curNode.x,
                    y: curNode.y,
                    z: curNode.z
                };

                nodeNumberArr.push(nodeObj); //запись узла в список
                centerNodeObjArr.push(nodeObj); //запись узла в список

                curNode.x += objLenCoor.lenX;
                curNode.y += objLenCoor.lenY;
                curNode.z += objLenCoor.lenZ;

                curElem.ListNode[0] = midleNodeNum + j;
                j++;
                editor.NodeUpdate(midleNodeNum + j, curNode); //создание нового узла
                curElem.ListNode[1] = midleNodeNum + j; //назначение 2 узла для элементра
                editor.ElemUpdate(eI + j, curElem); //создание элемента
            }

            var nodeObj = {
                nodeNum: midleNodeNum + j,
                x: curNode.x,
                y: curNode.y,
                z: curNode.z
            };
            //добавление номера элемента
            elemNumberArr.push(eI + j);
            nodeNumberArr.push(nodeObj); //запись узла в список
            centerNodeObjArr.push(nodeObj); //запись узла в список

            curElem.ListNode[0] = midleNodeNum + j;
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
            var eQ = step; //кол-во элементов
            var baseElemNum = editor.ElemAdd(eQ); // ввод нового элемента в программу, номер первого элемента
            var eI = baseElemNum; // номер первого элемента
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
         * @returns {number} Возвращяет номер последнего елемнета
         */
        this.GetLastElemNumber = function () {
            return elemNumberArr[elemNumberArr.length - 1];
        };

        /**
         * @returns {Array} Возвращяет список всех узлов в виде объектов
         */
        this.GetAllNodes = function () {
            return nodeNumberArr;
        };

        /**
         * @returns {Array} Возвращяет список всех номеров элементов
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
                   * @returns {object} Объект с проекцими длин по всем координатам {
                          lenX,- проекция на ось Х
                          lenY, - проекция на ось Y
                          lenZ, - проекция на ось Z
                          lenghtReg, - Длина разбитогно региона
                          lengthElement - общая длина элемента}
                   */
        this.GetLengthRegion = function () {
            return objLenCoor;
        };

        /**
         * Задает занчение номера вида шарнира
         * @param {number} numbJoint - номер соединения: 0 или null - жесткое соодинение;
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
         * Вычесляет длину региона, общию длину, длтины проекций разбиения в зависимости от координат.
         * @param {object} endPoint - Объект первого узла
         * @param {object} startPoint - Объект послетнего узла
         * @param {number} step - Кол-во разбиений
         * @returns {object} Объект с проекцими длин по всем координатам
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
