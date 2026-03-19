/**
 * asynchronously wait for x ms
 * @param {Number} ms
 * @returns {Promise}
 */
exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};