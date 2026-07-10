const fs = require("fs");
const path = require("path");
const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
    host: "localhost",
    port: 6333,
});

// const COLLECTION = "normal_search";
// const COLLECTION = "scalar_search";
// const COLLECTION = "pq_search";
const COLLECTION = "binary_search";

async function main() {
    const data = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, "data", "embeddings.json"),
            "utf8"
        )
    );
    console.time("Insertion Time");

    const points = data.map(item => ({
        id: item.id,
        vector: item.embedding,
        payload: {
            text: item.text,
        },
    }));
    await client.upsert(COLLECTION, {
        wait: true,
        points,
    });

    console.timeEnd("Insertion Time");
    console.log(`${points.length} vectors inserted.`);
}

main();