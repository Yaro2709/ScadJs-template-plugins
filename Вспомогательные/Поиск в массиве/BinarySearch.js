/**
 * ����� ��������� �������� � ������� ��������� �� ��������������� �� ����������� �������� �������� (����� ��������� � ������� ������ ������ ���� ������������)
 * @param {[number]} array ������
 * @param {number} i �������� ������
 * @returns ��������� ������� ��� -1 ���� ������� �� ������
 */
 function binarySearch(array, i) {
	var arr = array.slice();
    var mid = Math.floor(arr.length / 2);

    if (arr[mid] === i) {
        return arr[mid];
    } else if (arr[mid] < i && arr.length > 1) {
        return binarySearch(arr.splice(mid, Number.MAX_VALUE), i);
    } else if (arr[mid] > i && arr.length > 1) {
        return binarySearch(arr.splice(0, mid), i);
    } else {
        return -1;
    }
}