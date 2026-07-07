const client = require("../config/qdrant");
require("dotenv").config();

async function info() {
    const result = await client.getCollection(
        process.env.COLLECTION_NAME
    );
    console.log(result);
}

info();

// You'll see
// ------------
// Vector Count
// Dimension
// Distance
// Status
// Optimizer
// Segments