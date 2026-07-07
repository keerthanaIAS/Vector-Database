const vectorStore = require("./vectorStore");
const sampleData = require("./sampleData");

function insertVectors() {

  vectorStore.points.push(...sampleData);

  console.log("✅ Vectors Inserted Successfully\n");

  console.table(vectorStore.getAll());

}

module.exports = insertVectors;