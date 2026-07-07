const vectorStore = require("./vectorStore");

function retrieveVector(id) {

  const point = vectorStore
    .getAll()
    .find(doc => doc.id === id);

  if (!point) {
    console.log("❌ Vector Not Found");
    return;
  }

  console.log("✅ Retrieved Vector\n");
  console.log(point);

}

module.exports = retrieveVector;