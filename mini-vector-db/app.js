const insertVectors = require("./insert");
const retrieveVector = require("./retrieve");
const updateVector = require("./update");
const deleteVector = require("./delete");
const search = require("./search");

console.log("\n========== MINI VECTOR DATABASE ==========\n");

insertVectors();

console.log("\n================ Retrieve ================\n");

retrieveVector(2);

console.log("\n================ Update ==================\n");

updateVector(
    2,
    [0.99, 0.12, 0.40],
    {
        name: "Dog Updated",
        category: "Animal",
        country: "Canada"
    }
);

retrieveVector(2);

console.log("\n================ Delete ==================\n");

deleteVector(4);

console.log("\n================ Search ==================\n");

const queryVector = [0.90, 0.10, 0.40];

const results = search(queryVector, 3);

console.table(results);