//encoding windows 1251 !!!
//В файле расположены все  для работы функции. Для использования копировать все содержимое

/**
 * Объект для создания фермы классической по серии молодечно
 *  Ферма:
 * -типа: молодечно
 * -Скатная по середине/плоская
 * -Не может быть поднята в одном конце
 * @param {*} editor SCAD
 * @param {object} startNode Стартовый узел
 * @param {object} endNode последний узел
 * @param {number} numbSection количество панелей
 * @param {number} hightStart начальная высота
 * @param {number} hightRise Высота в коньке
 * @param {boolean} enableJoint Включение выключение шарниров во всей решетки фермы
 * @param {boolean} enableRacksBeam учитывать стойки фермы или нет: true - учитывать
 * @param {boolean} enableCenterRack Отключить центральную стойку: true - включена
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
    // Проверка 
    if (_hightRise < _hightStart) {
        _hightRise = _hightStart;
    }

    var lengTopReg = 0; //Длина региона верхнего пояса
    var lengTopElem = 0; //Длина верхнего пояса полуфермы

    var topNodeArr = []; //Массив узлов верхнего пояса
    var botNodeArr = []; // Массив узлов нижнего пояса
    var startNodeArr = []; //Массив опорных узлов

    var trussElArr = []; //Список элементов раскосов
    var trussRacksElArr = []; //Список элементов стоек
    var topElNumbArr = []; //Номера элементов верхнего пояса
    var botElNumbArr = []; //Номера элементов нижнего пояса
    var cellElNumbArr = []; //Список номеров элементов раскоса
    var pillarCellElNumbArr = []; //Список номеров элементов опорных раскосов
    var racksElNumbArr = []; //Список номеров элементов Стоек
    var сolumnElemNumbers = []; //Номера колонн
    var ae_centerRack = []; //Список номеров Центральной стойки

    var trussLen = 0; //длина фермы

    //Коньковый узел
    var hightNode;
    var topNumSection = 0;
    var topLenRegion = 0; //длина региона в плоскостях

    /**
     * Создать ферму
     */
    this.Create = function () {
        CreateTopBeam();
        CreateBotBeam();
        CreateTrussCell();
        CreateRacks();
    };

    //#region private method

    /**
     * Создание верхнего пояса фермы
     * @param {object} startNode Стартовый узел
     * @param {object} endNode последний узел
     * @param {number} hightStart начальная высота
     * @param {number} hightRise Высота в коньке
     * @param {number} numbSection количество панелей
     * @param {boolean} enableRacksBeam учитывать стойки фермы или нет: true - учитывать
     * @param {boolean} enableJoint Включение выключение шарниров во всей решетки фермы
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

        trussLen = _topEndNode.x - _topStartNode.x; //длина фермы
        hightNode = CreateNode(
            _editor,
            _topStartNode.x + trussLen / 2,
            _topStartNode.y,
            _topStartNode.z + (_hightRise - _hightStart)
        );

        //#region Верхний пояс

        //Включение доп узлов для стоек
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
        ); //левая  часть
        var topBeamR = new Beam(
            _editor,
            hightNode,
            _topEndNode,
            topNumSection,
            3
        ); //правая  часть
        //Заполнение номерами
        [].push.apply(topElNumbArr, topBeam.GetAllNumbersElements());
        [].push.apply(topElNumbArr, topBeamR.GetAllNumbersElements());

        if (_enableRacksBeam) {
            topLenRegion = topBeam.GetLengthRegion().lenX * 2; //длина региона в плоскостях
        } else {
            topLenRegion = topBeam.GetLengthRegion().lenX; //длина региона в плоскостях
        }

        topNodeArr = topBeam.GetAllNodes(); //список узлов верхнего пояса
        [].push.apply(topNodeArr, topBeamR.GetAllNodes()); //добавление узлов верхнего пояса от правой части
        topNodeArr = UniqArrObjNode(topNodeArr);

        lengTopReg = topBeam.GetLengthRegion().lenghtReg;
        lengTopElem = topBeam.GetLengthRegion().lengthElement;
        //#endregion
    }

    /**
     *
     * @param {object} startNode Стартовый узел
     * @param {object} endNode последний узел
     */
    function CreateBotBeam() {
        //#region нижний пояс

        var bottomBeam = new Beam(
            _editor,
            _startNode,
            _endNode,
            _numbSection * 2 * 2,
            1
        );
        botNodeArr = bottomBeam.GetAllNodes(); //список узлов нижнего пояса
        botElNumbArr = bottomBeam.GetAllNumbersElements();

        //дополнительные узлы для включения и выключения балок по краям

        //опорные стойки
        var pilRackLeft = new Beam(_editor, _startNode, topNodeArr[0], 0, 0);
        [].push.apply(сolumnElemNumbers, pilRackLeft.GetAllNumbersElements());
        var pilRackRight = new Beam(
            _editor,
            _endNode,
            topNodeArr[topNodeArr.length - 1],
            0,
            0
        );
        [].push.apply(сolumnElemNumbers, pilRackRight.GetAllNumbersElements());

        //#endregion
    }

    /**
     * Создание раскосов в ферме
     * @param {boolean} enableRacksBeam учитывать стойки фермы или нет: true - учитывать
     * @param {boolean} enableJoint Включение выключение шарниров во всей решетки фермы
     */
    function CreateTrussCell() {
        //#region Раскосы
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
     * Создание Стоекфермы в ферме
     * @param {boolean} enableRacksBeam учитывать стойки фермы или нет: true - учитывать
     * @param {boolean} enableJoint Включение выключение шарниров во всей решетки фермы
     */
    function CreateRacks() {
        var enableCellJoint = 1;
        if (!_enableJoint) {
            enableCellJoint = 0;
        }

        //#region Стойки фермы
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
                ); //от низа к верху
            }

            for (var i = 0; i < trussRacksElArr.length; i++) {
                [].push.apply(
                    racksElNumbArr,
                    trussRacksElArr[i].GetAllNumbersElements()
                );
            }
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
    //#endregion
    /**
     * @returns {[]} Возвращает массив из опорных узлов
     */
    this.GetStartNode = function () {
        return startNodeArr;
    };

    /**
     * @returns {[]} Возвращает список всех узлов верънего пояса
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
        connectionNodesArr.push(
            botNodeArr[botNodeArr.length - 1],
            topNodeArr[topNodeArr.length - 1]
        );
        return connectionNodesArr;
    };
    /**
     * @returns {[]} Возвращает список узлов для присоединения слева
     */
    this.GetLeftConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(botNodeArr[0], topNodeArr[0]);
        return connectionNodesArr;
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
     * @returns {[]} Возвращает список номеров элементов стоек
     */
    this.GetAllNumbersElementsRacks = function () {
        return racksElNumbArr;
    };

    /**
     * @returns {[]} Возвращает список номеров элементов опорных раскосов
     */
    this.GetAllNumbersElementsPillarCell = function () {
        return pillarCellElNumbArr;
    };
    /**
     * @returns {[]} Возвращает список номеров элементов колонн
     */
    this.GetColumnNumbersElements = function () {
        return сolumnElemNumbers;
    };

    /**
     * @returns {[]} Возвращает список номеров элементов центральной стойки
     */
    this.GetNumberElementsCenterRack = function () {
        return ae_centerRack;
    };

    /**
     * @returns {number} Возвращает дилину участка панели (от прогона до прогона)
     */
    this.GetAllLenghTopBeamReg = function () {
        return parseFloat(lengTopReg);
    };

    /**
     * Возвращает значениями угла наклона верхнего пояса фермы в градусах
     */
    this.GetAngleTruss = function () {
        var a = lengTopElem; //Длина верхнего пояса полуфермы
        var b = trussLen / 2;
        var c = hightNode.z - _startNode.z;

        var cosA = (a * a + b * b - c * c) / (2 * a * b);
        var radA = Math.acos(cosA);
        var numbAngelA = radA * (180 / Math.PI);

        return numbAngelA;
    };
    /**
     *
     * @returns {number} Возвращает массив из всех номеров элементов в ферме
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
     * @returns {number} Возвращает высоту фермы в опоре
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

    //#endregion
}
