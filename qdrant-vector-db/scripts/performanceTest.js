const client = require("../config/qdrant");
require("dotenv").config();

async function performance() {
    console.time("Search");
    await client.query(process.env.COLLECTION_NAME, {
        query: [0.92,0.10,0.40],
        limit: 5
    });
    console.timeEnd("Search");
}

performance();