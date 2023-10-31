/*
|-------------------------------------------
|     <10  | 11 - 249 | 250 - 2499 | >2500 |
|-------------------------------------------
| 1 | 100% |    85%   |     80%    |  75%  |
| 2 | 100% |    80%   |     75%    |  70%  |
| 3 | 100% |    70%   |     65%    |  60%  |
| 4 | 100% |    50%   |     50%    |  55%  |
|-------------------------------------------
*/

const ranges = [10,250,2500]
const percentageMatrix = [
    [1,   0.85, 0.8, 0.75],
    [1,   0.75, 0.75, 0.7],
    [1,   0.6, 0.60, 0.6],
    [.95, 0.4, 0.4, 0.45]
]

const calculatePrices = (conditionCode, price) => {
    if(price === undefined || price === null || price === '' || price === 0) return "NULL";
    let temp = parseInt(price);
    // last updated 10/30/23
    let priceCode;
    if (temp < ranges[0]) {
        priceCode = 0;
    }
    else if (temp >= ranges[0] && temp <= ranges[1] - 1) {
        priceCode = 1;
    }
    else if (temp >= ranges[1] && temp <= ranges[2] - 1) {
        priceCode = 2;
    }
    else if (temp > ranges[2]) {
        priceCode = 3;
    }
    let factor = percentageMatrix[conditionCode - 1][priceCode];
    return factor * temp;
}
module.exports = calculatePrices;