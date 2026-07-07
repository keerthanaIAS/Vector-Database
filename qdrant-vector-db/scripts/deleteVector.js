const client = require("../config/qdrant");
require("dotenv").config();

async function deleteVector() {

    await client.delete(process.env.COLLECTION_NAME, {
        wait: true,
        points: [5]
    });
    console.log("✅ Deleted");

}

deleteVector();