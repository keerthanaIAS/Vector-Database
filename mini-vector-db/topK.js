function topK(results, k) {

    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, k);

}

module.exports = topK;