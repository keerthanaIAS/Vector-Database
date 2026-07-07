const client = require("../config/qdrant");
const products = require("../data/sampleData");
require("dotenv").config();

async function insertVectors() {

    try {

        await client.upsert(process.env.COLLECTION_NAME, {
            wait: true,
            points: products
        });

        console.log("✅ Vectors inserted successfully");

    } catch (error) {

        console.log(error);

    }

}

insertVectors();