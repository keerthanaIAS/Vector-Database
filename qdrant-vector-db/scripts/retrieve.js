const client = require("../config/qdrant");
require("dotenv").config();

async function retrievePoint() {
  try {
    const result = await client.retrieve(process.env.COLLECTION_NAME, {
      ids: [1],
      with_payload: true,
      with_vector: true,
    });

    console.log("✅ Retrieved Point:\n");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
  }
}

retrievePoint();