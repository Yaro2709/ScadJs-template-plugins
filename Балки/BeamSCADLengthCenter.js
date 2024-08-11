//encoding windows 1251 !!!
//В файле расположены все  для работы функции. Для использования копировать все содержимое

/**
 * Создание балки:
 			-с разбиением на 2 части с выбором расстояния от стартового узла до центрального
			-c включением шарниров
 * @param {*} editor - Основные параметр создания
 * @param {object} startNode - Объект первого узла
 * @param {object} endNode - Объект последнего узла
 * @param {number} step - Расстояние от стартового узла до центрального
 * @param {number} joint - Включение шарниров по обеим концам: 0 или null - жесткое соединение;
 * 															  1 - шарниры по Ux и Uy по 2 концам
 * 															  2 - шарниры по Ux и Uy в начале
 * 														      3 - шарниры по Ux и Uy в конце
 */
function BeamLengthCenter(editor, startNode, endNode, step, joint) {
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
    this.GetAllNumbersElemets = function () {
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
     * Вычисляет длину региона, общие длину, длины проекций разбиения в зависимости от координат.
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
