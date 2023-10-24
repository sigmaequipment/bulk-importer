const APILimiter = require('../limiter/limiter.js');

const ChannelAdvisorLimiters = {
    uploadLimiter: APILimiter(1),
    authLimiter: APILimiter(2000,1,5),
}

module.exports = ChannelAdvisorLimiters;