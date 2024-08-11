/**
 * ќпределение уникальных чисел в массиве
 * @param {*} array ћассив чисел
 * @returns ћассив с уникальными числами
 */
function UniqueNumberArr(array) {
    var out = [];
    for (var i = 0, len = array.length; i < len; i++) {
        if (!FindNumberInArr(out, array[i])) {
            out.push(array[i]);
        }
    }
    return out;

    /**
     * ѕоиск числа в массиве перебором
     * @param {[number]} arr массив чисел
     * @param {number} number число поиска
     * @returns true - если число найдено в массиве
     */
    function FindNumberInArr(arr, number) {
        var isFind = false;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === number) {
                isFind = true;
                break;
            }
        }
        return isFind;
    }
}