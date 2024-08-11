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