//encoding windows 1251 !!!
//В файле расположены все  для работы функции. Для использования копировать все содержимое

/**
 * Создает вертикальную колонну заданной высоты. Создается по координатам
 * @param {*} editor
 * @param {number} x координата по Х.
 * @param {number} y координата по Y.
 * @param {number} z координата по Z.
 * @param {number} lenZ Высота колонны.
 * @param {[number]} lengtSliceArr Список расстояний, от стартового узла, на которые делится колонна. Список должен содержать желаемые
 * расстояния деления колонны. Пример - общая длина lenZ = 10м разбить на 2 равные части lengtSliceArr = [5]
 */
function ColumnSliceSCADxyz(editor, x, y, z, lenZ, lengtSliceArr) {
    this.elementInfo = {
        id: "c_6",
        connect: 0
    };

    var elemNumberArr = []; //список номеров элементов
    var nodeNumberArr = []; //список объектов узлов
    var centerNodeObjArr = []; //список центральных объектов узлов


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
            nQ = 2; //количество узлов
            baseNodeNum = editor.NodeAdd(nQ); //Номер первого узла
            endNodeNum = countNod + baseNodeNum;

            eQ = 1; //кол-во элементов
            baseElemNum = editor.ElemAdd(eQ); // номер первого элемента
            eI = baseElemNum; // номер первого элемента
            elemNumberArr.push(eI);

            //#region Создание элементов, узлов

            curNode = {
                x: x,
                y: y,
                z: z
            }; //объект с координатами, для узлов
            //Стартовый узел
            (editor.NodeUpdate(baseNodeNum, curNode));
            AddNode(baseNodeNum, curNode, nodeNumberArr);

            //Верхний узел
            curNode.z = columnLength;
            (editor.NodeUpdate(endNodeNum, curNode));
            AddNode(endNodeNum, curNode, nodeNumberArr);

            curElem.ListNode[0] = baseNodeNum; //номера узлов в список для создания элем
            curElem.ListNode[1] = endNodeNum; //номера узлов в список для создания элем

            //Создание элемента
            (editor.ElemUpdate(eI, curElem));

            //#endregion
        } else {
            nQ = correctLenArr.length + 2;
            baseNodeNum = editor.NodeAdd(nQ); //Номер первого узла

            eQ = correctLenArr.length + 1; //кол-во элементов
            baseElemNum = editor.ElemAdd(eQ); // номер первого элемента
            eI = baseElemNum; // номер первого элемента

            //#region Создание элементов, узлов
            var hieghtZ = 0;
            //Узел
            curNode = {
                x: x,
                y: y,
                z: z
            }; //объект с координатами, для узлов
            (editor.NodeUpdate(baseNodeNum, curNode));
            AddNode(baseNodeNum, curNode, nodeNumberArr);

            curElem.ListNode[0] = baseNodeNum;
            //Центральные узлы
            var j = 1;
            for (var i = 0; i < correctLenArr.length; i++) {
                hieghtZ += correctLenArr[i];

                //Узел
                curNode = {
                    x: x,
                    y: y,
                    z: z + hieghtZ
                }; //объект с координатами, для узлов
                (editor.NodeUpdate(baseNodeNum + j, curNode));
                AddNode(baseNodeNum + j, curNode, nodeNumberArr);
                AddNode(baseNodeNum + j, curNode, centerNodeObjArr);

                //Создание элемента
                curElem.ListNode[1] = baseNodeNum + j; //номера узлов в список для создания элем
                (editor.ElemUpdate(eI + i, curElem));
                elemNumberArr.push(eI + i); //первый элемент
                curElem.ListNode[0] = baseNodeNum + j;
                j++;
            }

            //Узел завершающий
            curNode = {
                x: x,
                y: y,
                z: z + columnLength
            }; //объект с координатами, для узлов
            (editor.NodeUpdate(baseNodeNum + nQ - 1, curNode));
            AddNode(baseNodeNum + nQ - 1, curNode, nodeNumberArr);

            //Создание элемента
            curElem.ListNode[1] = baseNodeNum + nQ - 1;
            (editor.ElemUpdate(eI + eQ - 1, curElem));
            elemNumberArr.push(eI + eQ - 1); //первый элемент
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
     * Возвращает объект последнего узла
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
     * Рассчитывает координаты последнего узла и возражает узел
     * @returns {object}  объект узла
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
     * Рассчитывает длину из значений массива для исключения выхода узлов за длину колонны
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
