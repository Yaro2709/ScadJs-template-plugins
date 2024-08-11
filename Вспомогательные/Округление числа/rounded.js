/**
 * Округление числа до n знаков после запятой
 * @param {*} number число округления
 * @param {*} r_num количиство знаков после запятой
 * @returns округленное число
 */
 function rounded(number, r_num) {
    return +number.toFixed(r_num);
}