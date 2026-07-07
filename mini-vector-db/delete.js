const vectorStore = require("./vectorStore");

function deleteVector(id) {

    const index = vectorStore
        .getAll()
        .findIndex(doc => doc.id === id);

    if (index === -1) {
        console.log("❌ Vector Not Found");
        return;
    }

    vectorStore.points.splice(index, 1);

    console.log(`✅ Vector ${id} Deleted`);

}

module.exports = deleteVector;

// MongoDB → deleteOne()
// Qdrant → delete()