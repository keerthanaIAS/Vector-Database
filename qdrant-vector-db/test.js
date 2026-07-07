const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
  url: "http://localhost:6333",
  checkCompatibility: false,
});

async function test() {
  try {
    const result = await client.getCollections();
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

test();