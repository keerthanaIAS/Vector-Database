const client = require("../config/qdrant");

async function listCollections() {
    const collections = await client.getCollections();
    console.log(collections);
}

listCollections();