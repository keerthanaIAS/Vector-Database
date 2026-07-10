const { QdrantClient } = require("@qdrant/js-client-rest");
const { pipeline } = require("@xenova/transformers");

const client = new QdrantClient({
    host: "localhost",
    port: 6333,
});

const collections = [
    "normal_search",
    "scalar_search",
    "pq_search",
    "binary_search",
];

async function searchCollection(collection, queryVector) {

    const start = performance.now();

    const result = await client.query(collection, {
        query: queryVector,
        limit: 5,
        with_payload: true,
    });

    const end = performance.now();

    return {
        collection,
        time: (end - start).toFixed(2),
        results: result.points,
    };
}

async function main() {

    console.log("Loading embedding model...\n");

    const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
    );

    const query = "Apple mobile phone";

    console.log("Query:", query);

    const embedding = await extractor(query, {
        pooling: "mean",
        normalize: true,
    });

    const queryVector = Array.from(embedding.data);

    console.log("\n============================================");

    for (const collection of collections) {

        const benchmark = await searchCollection(
            collection,
            queryVector
        );

        console.log(`\nCollection : ${benchmark.collection}`);
        console.log(`Search Time : ${benchmark.time} ms`);

        console.table(
            benchmark.results.map((item, index) => ({
                Rank: index + 1,
                Product: item.payload.text,
                Score: item.score.toFixed(6),
            }))
        );

        console.log("--------------------------------------------");
    }

}

main();