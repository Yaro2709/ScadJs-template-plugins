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

        //Создание колонны
        var column = new ColumnTwoBranch(editor, 0, 0, 6, 1, 5, 0.2, 3,[0.5,1],true, 0.3, [2, 4], true);
        column.CreateColumn();

        //вывод информации из объекта
        var nodeArr = column.GetLeftColumNodes(); //список всех узлов левой ветви
        var elemNumbArr = column.GetLeftColumElemNumbers(); //список всех номеров элементов левой ветви

    } catch (e) {
        engine.Cancel(e);
    }
}

//===============================================================================
//#region SCAD Functions


/**
 * Создает двухветвевую колонну
 * @param {*} editor
 * @param {number} coorX Координата Х.
 * @param {number} coorY Координата У.
 * @param {number} hightTwoBeam Высота 2х ветвей до подколонной части
 * @param {number} widthTwoBeam Ширина 2х ветвей
 * @param {number} numberSliceTwoBeam Кол-во разбиений 2х ветвей
 * @param {number} offsetSupColumn Отступ от 1 ветви до верхней колонны
 * @param {number} hightSupColumn Высота верхней колонны
 * @param {[number]} sliceSupColumn Массив длин разбиение верхней колонны на части
 * @param {boolean} isReversCell направление решетки: true - начало с левой, false - начало с правой
 * @param {number} offsetCell Отступ решетки от ветвей колонны
 * @param {[number]} numberRacksBeamArr массив номеров в каких пролетах должны быть распорки по
 * двум ветвям: [2, 5] - 2 самый низкий пролет если пролетов меньше 5 то пропускает
 * @param {boolean} isOneFoundation Опорная часть будет из двух частей или из 1: true - из одной
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
    //#region Массивы
    var allElemNumbers = [];
    var allNodes = [];
    //Две ветви
    var craneNodes = []; //узлы/узел для подкрановых балок
    var leftColumnNodes = []; //Массив узлов левой колонны
    var rightColumnNodes = []; //Массив узлов правой колонны
    var startNodeSupColumn; //Стартовый нод верхней колонны
    allNodes.push(craneNodes, leftColumnNodes, rightColumnNodes);

    var leftColumnElemNumbers = []; //Массив номеров левой колонны
    var rightColumnElemNumbers = []; //Массив номеров правой колонны
    var hightSupBeamElemNumbers = []; //Массив номеров верхней балки между ветвями
    allElemNumbers.push(
        leftColumnElemNumbers,
        rightColumnElemNumbers,
        hightSupBeamElemNumbers
    );

    //Верхняя колонна
    var hieghtNodeForBeam; //Узел для балок или ферм
    var supCenterNodes = []; //Центральные узлы
    allNodes.push(supCenterNodes);

    var supColumnNumbers = []; //список номеров элементов верхней колонны

    //Сетка
    var cellNodes = []; ////Массив узлов решетки

    var cellElemNumbers = []; //Массив номеров решетки
    allElemNumbers.push(cellElemNumbers);

    //Распорки
    var racksElemNumbers = []; //Массив номеров распорок
    allElemNumbers.push(racksElemNumbers);

    //Base
    var baseNodes = []; //Массив узлов базы колонны

    var baseColumnElemNumbers = []; //Массив номеров базы колонны
    allElemNumbers.push(baseColumnElemNumbers);

    //#endregion
    /*****************************************/
 
    /**
     * Создание двухветвевой колонны
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

        //объединение перемещений решетки колонны
        for (var i = 0; i < cellNodes.length; i++) {
            DOF("ColumnUnion", 63, cellNodes[i]);
        }

        CreateBase(isOneFoundation, widthTwoBeam);
    };

    //#region private method
    /**
     *
     * @param {number} hightColumn высота подкрановой части
     * @param {number} width Ширина подкрановой части
     * @param {number} split Количество разбиений
     * @param {number} offset Отступ от оси колонны
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
     * Создает Верхнию колонну двухветвевой колонны
     * @param {number} startHight начальная высота
     * @param {number} hight Основая высота верхней колонны
     * @param {[number]]} split Массив разбиения колонны
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
     * Создает решетку колонны
     * @param {boolean} isRevers Способ построения
     * @param {number} offset отступ сетки от ветвей колонны
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
     * создает распорки по двум ветвям в зависимости от выбранных соединений на колоннах
     * @param {[number]} arrNumbers Номера в каких пролетах должны быть распорки по двум ветвям: [1, 5]1 самый низкий пролет если пролетов меньше 5 то пропускает
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
     * Создает 2-х мерный список узлов для сетки колонны
     * @param {[object]} arrNodes1 Список узлов №1
     * @param {[object]} arrNodes2 Список узлов №2
     * @param {number} offset Отступ от центрального узла
     * @returns {[object]}  Возвращает 2-х мерный список узлов для сетки колонны
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
     * Определяет какой будет базой для сбора нагрузок
     * @param {boolean} isOneFoundation вид базы: true - первые узлы соединяются балкой с центральной колонной длиной 250мм по середине
     * false - от колонн отходят элементы 250мм высотой вниз
     * @param {number} width ширина колонны
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
     * Поворачивает оси подкрановых колонн
     * @param {number} angle Угол поворота колонн
     */
    this.RotateTwoColumnAxes = function (angle) {
        if (supColumnNumbers.length != 0) {
            //поворот левой
            RotateBeamAxes(edit, angle, leftColumnElemNumbers);
        }

        if (supColumnNumbers.length != 0) {
            //поворот правой
            RotateBeamAxes(edit, angle, rightColumnElemNumbers);
        }

        if (baseColumnElemNumbers.length != 0) {
            //поворот правой
            RotateBeamAxes(edit, angle, baseColumnElemNumbers);
        }
    };

    /**
     * Поворачивает оси верхней колонны
     * @param {number} angle Угол поворота колонн
     */
    this.RotateSupColumnAxes = function (angle) {
        //поворот левой
        if (supColumnNumbers.length != 0) {
            RotateBeamAxes(edit, angle, supColumnNumbers);
        }
    };

    /**
     *
     * @returns {[object]}  Возвращает список всех узлов левой ветви колонны
     */
    this.GetLeftColumNodes = function () {
        return leftColumnNodes;
    };

    /**
     *
     * @returns {[object]}  Возвращает список всех узлов правой ветви колонны
     */
    this.GetRightColumNodes = function () {
        return rightColumnNodes;
    };

    /**
     *
     * @returns {[object]}  Возвращает список всех центральных узлов верхней колонны
     */
    this.GetSupColumnCenterNodes = function () {
        return supCenterNodes;
    };

    /**
     * @returns Возвращает узел для опирания балок/ферм
     */
    this.GetLastObjNode = function () {
        return hieghtNodeForBeam;
    };
    /**
     * Рассчитывает координаты последнего узла и возвращает узел
     * @returns {object}  объект узла
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
     * @returns {[[object], [object]]} Возвращает узлы сетки колонны в 2х уровнего списка arr[1] всегда узел колонны,
     * остальные узлы сетки: [[nodeCell, nodeColumn, nodeCell], [nodeCell, nodeColumn, nodeCell], ....]
     */
    this.GetCellNodes = function () {
        return cellNodes;
    };

    /**
     * @returns Возвращает узлы базы
     */
    this.GetBaseNodes = function () {
        return baseNodes;
    };

    /**
     * @returns Возвращает узлы для подкрановых балок, содержит только 2 узла
     */
    this.GetCraneBeamNodes = function () {
        return craneNodes;
    };
    /**
     *
     * @returns {[number]}  Возвращает список номеров элементов левой ветви колонны
     */
    this.GetLeftColumElemNumbers = function () {
        return leftColumnElemNumbers;
    };

    /**
     *
     * @returns {[number]}  Возвращает список номеров элементов правой ветви колонны
     */
    this.GetRightColumElemNumbers = function () {
        return rightColumnElemNumbers;
    };

    /**
     *
     * @returns {[number]}  Возвращает список номеров верхней балки между ветвями
     */
    this.GetTopSupBeamElemNumbers = function () {
        return hightSupBeamElemNumbers;
    };

    /**
     *
     * @returns {[number]}  Возвращает список номеров элементов верхней колонны
     */
    this.GetSupColumnElemNumbers = function () {
        return supColumnNumbers;
    };

    /**
     *
     * @returns {[number]}  Возвращает список номеров элементов сетки колонны
     */
    this.GetCellElemNumbers = function () {
        return cellElemNumbers;
    };

    /**
     *
     * @returns {[number]}  Возвращает список номеров распорок
     */
    this.GetRacksElemNumbers = function () {
        return racksElemNumbers;
    };

    /**
     *
     * @returns {[number]}  Возвращает список номеров элементов базы
     */
    this.GetBaseElemNumbers = function () {
        return baseColumnElemNumbers;
    };

    /**
     *
     * @returns {[number]}  Возвращает список номеров всех элементов
     */
    this.GetAllNumbersElements = function () {
        var allNumbers = [];

        for (var i = 0; i < allElemNumbers.length; i++) {
            [].push.apply(allNumbers, allElemNumbers[i]);
        }

        return allNumbers;
    };
    /**
     * Возвращает длину колонны
     */
    this.GetColumnLength = function () {
        var columnLength = _hightSupColumn + _hightTwoBeam;
        return columnLength;
    };
    /**
     * Возвращает длину верхней колонны
     */
    this.GetSupColumnLength = function () {
        var supLenght = _hightSupColumn;
        return supLenght;
    };

    /**
     * Возвращает длину ветвей колонны
     */
    this.GetTwoColumnLength = function () {
        var twoColLen = _hightTwoBeam;
        return twoColLen;
    };

    /**
     * Возвращает список среза верхней колонне
     */
    this.GetSliceArr = function () {
        return _sliceSupColumn;
    };

    /**
     * Задает длину верхней колонны.
     */
    this.SetSupColumnLength = function (length) {
        _hightSupColumn = length;
    };
    /**
     * Задает длину двух ветвей.
     */
    this.SetTwoColumnLength = function (length) {
        _hightTwoBeam = length;
    };
    /**
     * Задает новый список срезов для верхней колонны
     * @param {[number]} newArr новый список срезов
     */
    this.SetSliceArr = function (newArr) {
        _sliceSupColumn = newArr;
    };
    //#endregion

    /*****************************************/

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
 * Создание балки:
 			-с разбиением на 2 части с выбором расстояния от стартового узла до центрального
			 -с учетом разного расположения узлов
			 -c включением шарниров
 * @param {*} editor - Основные параметр создания
 * @param {object} startNode - Объект первого узла
 * @param {object} endNode - Объект первого последнего узла
 * @param {number} step - Расстояние от стартового узла до центрального
 * @param {number} joint - Включение шарниров по обеим концам: 0 или null - жесткое соединение;
 * 															  1 - шарниры по Ux и Uy по 2 концам
 * 															  2 - шарниры по Ux и Uy в начале
 * 														      3 - шарниры по Ux и Uy в конце
 */
    function BeamLenghtCenter(editor, startNode, endNode, step, joint) {
        this.elementInfo = {
            id: "b_3",
            connect: 11
        };
        var elemNumberArr = []; //список номеров элементов
        var nodeNumberArr = []; //список объектов узлов
        var centerNodeObjArr = []; //список центральных объектов узлов

        var minLenRegion = 0.01; //минимальный регион

        this.joint = joint;
        //#region проверка

        if (joint > 3 || joint < 0) {
            this.joint = 1;
        }

        //#endregion

        //#region Элементы
        //Определение длины участков по всем координатам через объект
        var objLenCoor = LenghtRegion(startNode, endNode, step);
        var eQ = 1; //кол-во элементов
        if (
            step >= minLenRegion &&
            objLenCoor.lengthElement - minLenRegion >= step
        ) {
            eQ = 2; //кол-во элементов
        }

        var baseElemNum = editor.ElemAdd(eQ); // ввод нового элемента в программу, номер первого элемента
        var eI = baseElemNum; // номер первого элемента

        var curElem = { TypeElem: 5, ListNode: [0, 0] }; //Содержит объекты - Тип элемента 5, список узлов[start, end]
        var Joint = { Mask: 48, Place: 1 }; //Объект для задания шарниров
        //#endregion

        //#region Узлы
        //Если появляются средние пролеты то добавляются новые узлы
        if (eQ == 1) {
            curElem.ListNode[0] = startNode.nodeNum;
            curElem.ListNode[1] = endNode.nodeNum;
            (editor.ElemUpdate(eI, curElem)); //создание элемента

            elemNumberArr.push(eI);
            nodeNumberArr.push(startNode);
            nodeNumberArr.push(endNode);

            //#region Назначение шарниров по 2 концам
            if (this.joint == 1) {
                (editor.JointSet(eI, 1, Joint));
                (editor.JointSet(eI, 2, Joint));
            } else if (this.joint == 2) {
                (editor.JointSet(eI, 1, Joint)); //первый элемент
            } else if (this.joint == 3) {
                (editor.JointSet(eI, 2, Joint)); //последний элемент
            }

            //#endregion
        } else {
            var nQ = 1; //количество узлов
            var midleNodeNum = editor.NodeAdd(nQ); //Номер первого узла
            var curNode = {
                x: startNode.x + objLenCoor.lenX,
                y: startNode.y + objLenCoor.lenY,
                z: startNode.z + objLenCoor.lenZ
            };
            curElem.ListNode[0] = startNode.nodeNum; //назначение 1 узла для элемента, стартовый узел
            nodeNumberArr.push(startNode);

            for (var i = 0; i < nQ; i++) {
                (editor.NodeUpdate(midleNodeNum + i, curNode)); //создание нового узла
                curElem.ListNode[1] = midleNodeNum + i; //назначение 2 узла для элемента
                (editor.ElemUpdate(eI + i, curElem)); //создание элемента

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

                curElem.ListNode[0] = midleNodeNum + i;
            }

            curElem.ListNode[1] = endNode.nodeNum;
            (editor.ElemUpdate(eI + nQ, curElem));

            elemNumberArr.push(eI + nQ);
            nodeNumberArr.push(endNode);
            //#endregion

            //#region Назначение шарниров
            //по 2 концам
            if (this.joint == 1) {
                (editor.JointSet(eI, 1, Joint)); //первый элемент
                (editor.JointSet(eI + nQ, 2, Joint)); //последний элемент
            }
            //Шарнир в начале
            if (this.joint == 2) {
                (editor.JointSet(eI, 1, Joint)); //первый элемент
            }
            //Шарнир в конце
            if (this.joint == 3) {
                (editor.JointSet(eI + nQ, 2, Joint)); //последний элемент
            }
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
                (editor.JointSet(eI, 1, Joint));
                (editor.JointSet(eI, 2, Joint));
            } else if (numbJoint == 2) {
                (editor.JointSet(eI, 1, Joint)); //первый элемент
            } else if (numbJoint == 3) {
                (editor.JointSet(eI, 2, Joint)); //последний элемент
            }
        };
        /**
         * Вычисляет длину региона, длины проекций разбиения в зависимости от координат.
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
     * Создает одноветровую вертикальную колонну заданной высоты. Начинается со стартового узла
     * @param {*} editor
     * @param {number} lenZ Высота колонны.
     * @param {number} startNode Стартовый узел с которого начинается колонна.
     * @param {[number]} lengtSliceArr Список расстояний, от стартового узла, на которые делится колонна. Список должен содержать желаемые
     * расстояния. Пример общая длина lenZ = 10м разбить на 2 равные части lengtSliceArr = [5]
     */
    function ColumnSliceSCAD(editor, lenZ, startNode, lengtSliceArr) {
        this.elementInfo = {
            id: "c_5",
            connect: 1
        };

        var elemNumberArr = []; //список номеров элементов
        var nodeNumberArr = []; //список объектов узлов
        var centerNodeObjArr = []; //список центральных объектов узлов

        if (startNode != null) {
            nodeNumberArr.push(startNode);
        }

        var columnLength = parseFloat(lenZ);
        var _lengtSliceArr = lengtSliceArr;
        var nQ = 0; //количество узлов
        var eQ = 1; //кол-во элементов
        var baseElemNum = 0; // номер первого элемента
        var eI = 0; // номер первого элемента
        var countNod = 1; //Счетчик узлов

        var baseNodeNum = 0;
        var endNodeNum = 0;

        var correctLenArr; //корректный массив с длинами разбития может быть null

        var curNode = {};
        var curElem = {
            TypeElem: 5,
            ListNode: [0, 0]
        }; //Содержит объекты - Тип элемента 5, список узлов[start, end]

        /**
         * Создание колонны
         */
        this.CreateColumn = function () {
            correctLenArr = GetCorrectLenArr();
            if (correctLenArr == null || correctLenArr.length == 0) {
                if (startNode == null) {
                    nQ = 2; //количество узлов
                    baseNodeNum = editor.NodeAdd(nQ); //Номер первого узла
                    endNodeNum = countNod + baseNodeNum;
                } else {
                    nQ = 1; //количество узлов
                    baseNodeNum = startNode.nodeNum; //Номер первого узла
                    endNodeNum = editor.NodeAdd(nQ); //Номер последнего узла
                }

                eQ = 1; //кол-во элементов
                baseElemNum = editor.ElemAdd(eQ); // номер первого элемента
                eI = baseElemNum; // номер первого элемента
                elemNumberArr.push(eI);

                //#region Создание элементов, узлов

                if (startNode == null) {
                    curNode = {
                        x: 0,
                        y: 0,
                        z: 0
                    }; //объект с координатами, для узлов

                    editor.NodeUpdate(baseNodeNum, curNode);
                    AddNode(baseNodeNum, curNode, nodeNumberArr);

                    curNode.z = columnLength;
                    editor.NodeUpdate(endNodeNum, curNode);
                    AddNode(endNodeNum, curNode, nodeNumberArr);

                    curElem.ListNode[0] = baseNodeNum; //номера узлов в списке для создания элем
                    curElem.ListNode[1] = endNodeNum; //номера узлов в списке для создания элем
                } else {
                    curNode = {
                        x: startNode.x,
                        y: startNode.y,
                        z: startNode.z + columnLength
                    }; //объект с координатами, для узлов
                    editor.NodeUpdate(endNodeNum, curNode);
                    AddNode(endNodeNum, curNode, nodeNumberArr);

                    curElem.ListNode[0] = baseNodeNum; //номера узлов в списке создания элем
                    curElem.ListNode[1] = endNodeNum; //номера узлов в списке создания элем
                }
                //Создание элемента
                editor.ElemUpdate(eI, curElem);

                //#endregion
            } else {
                nQ = correctLenArr.length + 1;
                baseNodeNum = editor.NodeAdd(nQ); //Номер первого узла

                eQ = correctLenArr.length + 1; //кол-во элементов
                baseElemNum = editor.ElemAdd(eQ); // номер первого элемента
                eI = baseElemNum; // номер первого элемента

                //#region Создание элементов, узлов
                var hieghtZ = 0;
                curElem.ListNode[0] = startNode.nodeNum;

                for (var i = 0; i < correctLenArr.length; i++) {
                    hieghtZ += correctLenArr[i];

                    //Узел
                    curNode = {
                        x: startNode.x,
                        y: startNode.y,
                        z: startNode.z + hieghtZ
                    }; //объект с координатами, для узлов
                    editor.NodeUpdate(baseNodeNum + i, curNode);
                    AddNode(baseNodeNum + i, curNode, nodeNumberArr);
                    AddNode(baseNodeNum + i, curNode, centerNodeObjArr);

                    //Создание элемента
                    curElem.ListNode[1] = baseNodeNum + i; //номера узлов в списке для создания элем
                    editor.ElemUpdate(eI + i, curElem);
                    elemNumberArr.push(eI + i); //первый элемент
                    curElem.ListNode[0] = baseNodeNum + i;
                }

                //Узел
                curNode = {
                    x: startNode.x,
                    y: startNode.y,
                    z: startNode.z + columnLength
                }; //объект с координатами, для узлов
                editor.NodeUpdate(baseNodeNum + nQ - 1, curNode);
                AddNode(baseNodeNum + nQ - 1, curNode, nodeNumberArr);

                //Создание элемента
                curElem.ListNode[1] = baseNodeNum + nQ - 1;
                editor.ElemUpdate(eI + nQ - 1, curElem);
                elemNumberArr.push(eI + nQ - 1); //первый элемент
                //#endregion
            }
        };

        /**
         * @returns {[object]} Возвращает список всех узлов в виде объектов
         */
        this.GetAllNodes = function () {
            return nodeNumberArr;
        };

        /**
         * @returns Возвращает центральные узлы колонны. Если они не созданы возвращает null
         */
        this.GetCenterNodes = function () {
            return centerNodeObjArr;
        };

        /**
         * Рассчитывает координаты последнего узла и возвращает узел
         * @returns {object}  объект узла
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
         * Возвращает объект последнего узла из списка узлов
         * @returns {object}  объект узла
         */
        this.GetLastObjNode = function () {
            return nodeNumberArr[nodeNumberArr.length - 1];
        };

        /**
         * Возвращает объект первого узла
         * @returns {object} объект первого узла
         */
        this.GetStartObjNode = function () {
            return nodeNumberArr[0];
        };

        /**
         *
         * @returns {[number]}  Возвращает список номеров элементов
         */
        this.GetAllNumbersElements = function () {
            return elemNumberArr;
        };

        /**
         * Возвращает длину колонны
         */
        this.GetColumnLength = function () {
            return columnLength;
        };

        /**
         * Возвращает список среза
         */
        this.GetSliceArr = function () {
            return _lengtSliceArr;
        };

        /**
         * Задает длину колонны.
         */
        this.SetColumnLength = function (length) {
            columnLength = length;
        };

        /**
         * Задает новый список срезов
         * @param {[number]} newArr новый список срезов
         */
        this.SetSliceArr = function (newArr) {
            _lengtSliceArr = newArr;
        };
        /**
         * Рассчитывает длину из значений массива для исключения выхода узлов за заданию длину колонны
         * @returns  Коренное значение массива
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
         * Добавляет объект узла в список
         * @param {number} numbNode номер узла
         * @param {object} objNode объект по типу {x:0,y:0,z:0};
         * @param {object} writeArr Список для передачи
         */
        function AddNode(numbNode, objNode, writeArr) {
            //Узел для передачи

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
     * Поворачивает местные оси элементов на заданный угол
     * @param {*} editor SCAD
     * @param {number} angel Значение угла в градусах
     * @param {[number]} listElem Список номеров элементов
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
     * Создает объединение перемещений по маске в выбранных узлах
     * @param {string} text название
     * @param {number} mask маска закрепления
     * @param {[number]} list лист объединяемых узлов
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

        edit.DOFUnionAdd(DOFUnion); //объединение низа фермы
    }

    //#endregion
}

//#endregion
