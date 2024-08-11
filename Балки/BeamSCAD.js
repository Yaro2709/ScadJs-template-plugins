//encoding windows 1251 !!!
//В файле расположены все  для работы функции. Для использования копировать все содержимое

/**
 * Создание балки:
 			-с равным разбиением на части
			-c включением шарниров
 * @param {*} editor - SCAD параметр
 * @param {object} startNode - Объект первого узла
 * @param {object} endNode - Объект последнего узла
 * @param {number} step - Кол-во разбиений
 * @param {number} joint - Включение шарниров по обеим концам: 0 или null - жесткое соединение;
 * 															  1 - шарниры по Ux и Uy по 2 концам
 * 															  2 - шарниры по Ux и Uy в начале
 * 														      3 - шарниры по Ux и Uy в конце
 */
function BeamSCAD(editor, startNode, endNode, step, joint) {
    this.elementInfo = {
        id: "b_5",
        connect: 11,
        role: "any",
        incline: true,
        column: false
    };

    var elemNumberArr = []; //список номеров элементов
    var nodeNumberArr = []; //список объектов узлов
    var centerNodeObjArr = []; //список центральных объектов узлов
    _joint = joint;
    //#region проверка
    if (step <= 0) {
        step = 1;
    }

    if (_joint > 3 || _joint < 0) {
        _joint = 1;
    }

    //#endregion
    this.Create = function () {
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
            if (_joint == 1) {
                editor.JointSet(eI, 1, Joint); //первый элемент
                editor.JointSet(eI + nQ, 2, Joint); //последний элемент
            }
            //Шарнир в начале
            if (_joint == 2) {
                editor.JointSet(eI, 1, Joint); //первый элемент
            }
            //Шарнир в конце
            if (_joint == 3) {
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
            if (_joint == 1) {
                editor.JointSet(eI, 1, Joint);
                editor.JointSet(eI, 2, Joint);
            } else if (_joint == 2) {
                editor.JointSet(eI, 1, Joint); //первый элемент
            } else if (_joint == 3) {
                editor.JointSet(eI, 2, Joint); //последний элемент
            }

            //#endregion
        }
        //#endregion
    };

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
     * @returns {[]} Возвращает список узлов для присоединения справа
     */
    this.GetRightConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(nodeNumberArr[nodeNumberArr.length - 1]);
        return connectionNodesArr;
    };
    /**
     * @returns {[]} Возвращает список узлов для присоединения слева
     */
    this.GetLeftConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(nodeNumberArr[0]);
        return connectionNodesArr;
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
     * Задает значение номера вида шарнира
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
     * Возвращает значениями угла наклона балки
     */
    this.GetAngleBeam = function () {
        var numbAngelA = 0;
        var hight = startNode.z - endNode.z;
        if (hight != 0) {
            var math = new MathGeometry();
            var lengTopElem = math.LenghtRegion(startNode, endNode);

            var a = lengTopElem; //Длина верхнего пояса полуфермы
            var b = endNode.x - startNode.x;
            var c = hight;

            var cosA = (a * a + b * b - c * c) / (2 * a * b);
            var radA = Math.acos(cosA);
            numbAngelA = radA * (180 / Math.PI);
        }

        return numbAngelA;
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

    function MathGeometry() {
        /**
         * Вычисляет угол
         * @param {object} point1 Вершина 1 (узел)
         * @param {object} point2 Вершина 2 (узел)
         * @param {object} calcPoint Вершина, между ее сторонами вычисляется угол (узел)
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
         * Вычисляет длину региона, длину, длины проекций разбиения в зависимости от координат.
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
}


