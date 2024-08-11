/**
 * ����������� ���������� ����� � �������
 * @param {*} array ������ �����
 * @returns ������ � ����������� �������
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
     * ����� ����� � ������� ���������
     * @param {[number]} arr ������ �����
     * @param {number} number ����� ������
     * @returns true - ���� ����� ������� � �������
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