const vectorStore = require("./vectorStore");
const cosineSimilarity = require("./similarity");
const topK = require("./topK");

function search(queryVector, k = 3) {

    const results = [];
    const documents = vectorStore.getAll();
    for (const doc of documents) {
        const score = cosineSimilarity(queryVector, doc.vector);
        results.push({
            id: doc.id,
            score,
            payload: doc.payload
        });
    }
    return topK(results, k);

}

module.exports = search;

// Notice what happens:
// Query Vector
// ↓
// Compare with Doc1
// ↓
// Compare with Doc2
// ↓
// Compare with Doc3
// ↓
// Compare with Doc4
// ↓
// Compare with Doc5
// ↓
// Sort
// ↓
// Top-K
// This is Brute Force Search.