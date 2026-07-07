const client = require("../config/qdrant");
require("dotenv").config();

async function updateVector() {
  try {
    await client.upsert(process.env.COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: 1,
          vector: [0.95, 0.20, 0.50],
          payload: {
            name: "Tiger",
            category: "Animal",
            country: "India",
            rating: 5.0
          }
        }
      ]
    });

    console.log("✅ Point Updated");
  } catch (error) {
    console.error(error);
  }
}

updateVector();