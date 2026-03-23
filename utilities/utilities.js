/**
 * asynchronously wait for x ms
 * @param {Number} ms
 * @returns {Promise}
 */
exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

exports.levensheteinDist = (a, b) => { 
    if (!a || !b) return (a || b).length;
    var m = [];
    for(var i = 0; i <= b.length; ++i) {
        m[i] = [i];
        if(i === 0) continue;
        for(var j = 0; j <= a.length; ++j) {
            m[0][j] = j;
            if(j === 0) continue;
            m[i][j] = b.charAt(i - 1) == a.charAt(j - 1) ? m[i - 1][j - 1] : Math.min(
                m[i-1][j-1] + 1, // substitution
                m[i][j-1] + 1, // insertion
                m[i-1][j] + 1 // deletion
            );
        }
    }
    return m[b.length][a.length];
}