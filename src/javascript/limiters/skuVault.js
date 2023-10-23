const APILimiter = require('../limiter/limiter');

const veryLightSkuVault = APILimiter(200,1,25);
const lightSkuVault = APILimiter(20,1,5);
const moderateSkuVault = APILimiter(10,1,2);
const heavySkuVault = APILimiter(5,1,1);
const veryHeavySkuVault = APILimiter(1,1,1);

const skuVaultLimiters = {
    veryLight: veryLightSkuVault,
    light: lightSkuVault,
    moderate: moderateSkuVault,
    heavy: heavySkuVault,
    severe: veryHeavySkuVault,
}

module.exports = skuVaultLimiters;