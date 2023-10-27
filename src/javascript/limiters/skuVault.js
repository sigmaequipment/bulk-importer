const APILimiter = require('../limiter/limiter');

const veryLightSkuVault = APILimiter(100,1,25);
const lightSkuVault = APILimiter(100,1,5);
const moderateSkuVault = APILimiter(100,1,2);
const heavySkuVault = APILimiter(100,1,1);
const veryHeavySkuVault = APILimiter(1,1,1);

const skuVaultLimiters = {
    veryLight: veryLightSkuVault,
    light: lightSkuVault,
    moderate: moderateSkuVault,
    heavy: heavySkuVault,
    severe: veryHeavySkuVault,
}

module.exports = skuVaultLimiters;