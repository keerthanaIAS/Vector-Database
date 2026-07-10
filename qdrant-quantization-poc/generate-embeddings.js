const fs = require("fs");
const path = require("path");
const { pipeline } = require("@xenova/transformers");

async function main() {

    console.log("Loading embedding model...");

    const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
    );

    const products = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, "data", "products.json"),
            "utf8"
        )
    );

    const output = [];

    for (let i = 0; i < products.length; i++) {

        console.log(`Embedding ${i + 1}/${products.length}`);

        const embedding = await extractor(products[i], {
            pooling: "mean",
            normalize: true,
        });

        output.push({
            id: i + 1,
            text: products[i],
            embedding: Array.from(embedding.data),
        });
    }

    fs.writeFileSync(
        path.join(__dirname, "data", "embeddings.json"),
        JSON.stringify(output, null, 2)
    );

    console.log("\nEmbeddings saved.");
}

main();