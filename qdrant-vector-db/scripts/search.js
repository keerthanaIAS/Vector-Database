const client = require("../config/qdrant");
require("dotenv").config();

async function search() {

    const results = await client.query(process.env.COLLECTION_NAME, {
        query: [0.92, 0.10, 0.40],
        limit: 3,
        with_payload: true
    });

    console.log(JSON.stringify(results, null, 2));

}

search();