const vectorStore = require("./vectorStore");

function updateVector(id, newVector, newPayload) {

  const index = vectorStore
    .getAll()
    .findIndex(doc => doc.id === id);

  if (index === -1) {
    console.log("❌ Vector Not Found");
    return;
  }

  vectorStore.points[index] = {
    id,
    vector: newVector,
    payload: newPayload
  };

  console.log("✅ Vector Updated");

}

module.exports = updateVector;