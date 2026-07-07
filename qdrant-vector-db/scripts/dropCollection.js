const client = require("../config/qdrant");
require("dotenv").config();

async function dropCollection() {
    await client.deleteCollection(
        process.env.COLLECTION_NAME
    );
    console.log("✅ Collection Deleted");

}

dropCollection();