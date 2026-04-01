/**
 * asynchronously wait for x ms
 * @param {Number} ms
 * @returns {Promise}
 */
exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

exports.levenshteinDist = (a, b) => { 
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
};

exports.fuzzySearch = (searchTerm, arr, sort = true, accessFunc = undefined, maxDistance = 3) => {
    if (!accessFunc) accessFunc = a => a;
    if (!sort) return arr.filter(a => this.levenshteinDist(searchTerm, accessFunc(a)) < maxDistance);
    return arr.sort(
        (a, b) => this.levenshteinDist(searchTerm, accessFunc(a)) - this.levenshteinDist(searchTerm, accessFunc(b))
    ).filter(
        a => this.levenshteinDist(searchTerm, accessFunc(a)) < maxDistance
    );
}

// console.log(this.fuzzySearch("test", ["tes", "tabc", "test2", "tewt"]));