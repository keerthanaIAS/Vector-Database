const client = require("../config/qdrant");
require("dotenv").config();

async function upsertPoint() {
  try {
    const result = await client.upsert(process.env.COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: 6,
          vector: [0.85, 0.25, 0.45],
          payload: {
            name: "Elephant",
            category: "Animal",
            country: "India",
            rating: 4.9
          }
        }
      ]
    });

    console.log("✅ Upsert Successful");
    console.log(result);

  } catch (error) {
    console.error(error);
  }
}

upsertPoint();