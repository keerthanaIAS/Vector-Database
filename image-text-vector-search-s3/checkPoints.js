const qdrant = require("./config/qdrant");

// Here you should see all uploaded points.
async function check() {
    const result = await qdrant.scroll("images", {
        limit: 10,
        with_payload: true,
        with_vector: false
    });
    console.log(JSON.stringify(result, null, 2));
}

check();