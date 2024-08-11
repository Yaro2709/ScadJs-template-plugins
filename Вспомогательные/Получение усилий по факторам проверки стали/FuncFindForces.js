/**
 * Получение усилий по комбинации РСУ фактора стали
 * @param {SCAD} Result SCAD
 * @param {number} NumElem Номер элемента
 * @param {string} FactorFormula FactorsInfoDisp.FactorFormulaData (формула РСУ при которой вычислен фактор объекта FactorsInfoDisp метода GetSteelFactors программного интерфейса Result)
 * @returns Усилия в элементе по комбинации РСУ
 */

var settings = {
	DELTA_SEARCH_RSU_DATA : 0.0001 //Погрешность в поиске усилий по РСУ. В функуии AreArraysEqualDelta
}

function FuncFindForces(Result, NumElem, FactorFormula) {
    var DataTypeInfo = {
        QuantityAction: null
    };
    Result.GetDataTypeInfo(11, DataTypeInfo);

    var steelRsuStr = CreateSteelRsuObj(
        FactorFormula,
        DataTypeInfo.QuantityAction
    );
    var rsuStr = GetRsu(Result, NumElem, steelRsuStr);

    return rsuStr.ListData;

    /**
     * Функция получения всех рсу в элементе с фильтром номера сечения
     * @param {SCAD} result SCAD
     * @param {number} elemNum номер элемента
     * @param {object} fiterRsuStr объект рсу для поиска
     * @returns список rsu
     */
    function GetRsu(result, elemNum, searchRsu) {
        var NumElem = elemNum;
        var RsuInfo = {
            QuantityRsuStr: null
        };
        result.GetRsuInfo(NumElem, RsuInfo);
        var arrRsu;
        for (var i = 1; i <= RsuInfo.QuantityRsuStr; i++) {
            RsuStr = {
                NumPoint: null,
                ListNumLoad: null,
                ListCoef: null,
                ListData: null
            };

            result.GetRsuStr(NumElem, i, RsuStr);

            if (RsuStr.NumPoint == searchRsu.NumPoint) {
                if (RsuStr.ListNumLoad != null) {
                    RsuStr.ListNumLoad = RsuStr.ListNumLoad.toArray();
                    if (
                        !AreArraysEqual(
                            RsuStr.ListNumLoad,
                            searchRsu.ListNumLoad
                        )
                    ) {
                        continue;
                    }
                }
                if (RsuStr.ListCoef != null) {
                    RsuStr.ListCoef = RsuStr.ListCoef.toArray();
                    for (var j = 0; j < RsuStr.ListCoef.length; j++) {
                        RsuStr.ListCoef[j] = rounded(RsuStr.ListCoef[j], 4);
                    }
                }
                if (
                    AreArraysEqualDelta(
                        RsuStr.ListCoef,
                        searchRsu.ListCoef,
                        settings.DELTA_SEARCH_RSU_DATA
                    )
                ) {
                    if (RsuStr.ListData != null) {
                        RsuStr.ListData = RsuStr.ListData.toArray();
                    }
                    arrRsu = RsuStr;
                    break;
                }
            }
        }
        return arrRsu;
    }

    /**
     * Парсит строку в объект RsuStr
     * @param {string} RsuStr Строка FactorsInfoDisp.FactorFormulaData (0.952*L1+0.87*L2+0.29*L6~Сечение 3)
     * @param {number} loadCount Общее количество загружение (без кол-ва комбинаций)
     * @returns Объект RsuStr с заполнеными полями NumPoint, ListNumLoad, ListCoef
     */
    function CreateSteelRsuObj(RsuStr, loadCount) {
        var combArr = RsuStr.split("~");

        var arrCombSplit = combArr[0].split("+");

        var numCombArr = [];
        var coefCombArr = [];

        for (var i = 0; i < arrCombSplit.length; i++) {
            if (/L/.test(arrCombSplit[i])) {
                PuchInArr(arrCombSplit[i], 0);
            } else {
                PuchInArr(arrCombSplit[i], loadCount);
            }
        }

        var steelRsuStr = {
            NumPoint: parseInt(combArr[1].charAt(combArr[1].length - 1)),
            ListNumLoad: numCombArr,
            ListCoef: coefCombArr
        };

        return steelRsuStr;

        /**
         * Добавляет значения в списки
         * @param {string} value значение для записи
         */
        function PuchInArr(value, numCombCount) {
            var reg = /\**(L|C)/;
            var arr_s = value.split(reg);
            if (arr_s.length == 2) {
                coeff = rounded(parseFloat(arr_s[0]), 4);
                coefCombArr.push(coeff);

                var numComb = parseInt(arr_s[1]);
                numCombArr.push(numComb + numCombCount);
            } else {
                coefCombArr.push(1.0);

                var numComb = parseInt(arr_s[0]);
                numCombArr.push(numComb + numCombCount);
            }
        }
    }

    /**
     * Проверяет два массива на равенство друг другу
     * @param {[number]} array1 Массив №1
     * @param {[number]} array2 Массив №2
     * @returns true - если массивы равны содержанием
     */
    function AreArraysEqual(array1, array2) {
        if (!array2) {
            return false;
        }

        if (array1.length != array2.length) {
            return false;
        }

        for (var i = 0, l = array1.length; i < l; i++) {
            if (array1[i] instanceof Array && array2[i] instanceof Array) {
                if (!array1[i].equals(array2[i])) return false;
            } else if (array1[i] != array2[i]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Проверяет два массива на равенство друг другу с погрешностью
     * @param {[number]} array1 Массив №1
     * @param {[number]} array2 Массив №2
     * @param {[number]} delta  Погрешность
     * @returns true - если массивы равны содержанием
     */
    function AreArraysEqualDelta(array1, array2, delta) {
        if (!array2) {
            return false;
        }

        if (array1.length != array2.length) {
            return false;
        }

        for (var i = 0, l = array1.length; i < l; i++) {
            if (array1[i] instanceof Array && array2[i] instanceof Array) {
                if (!array1[i].equals(array2[i])) return false;
            } else if (array1[i] != array2[i]) {
                if (Math.abs(array2[i] - array1[i]) >= delta) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Округление до заданного количества знаков после запятой
     * @param {number} number число
     * @returns
     */
    function rounded(number, r_num) {
        return +number.toFixed(r_num);
    }
}