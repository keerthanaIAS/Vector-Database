const client = require("../config/qdrant");
require("dotenv").config();

async function filteredSearch() {
    const results = await client.query(process.env.COLLECTION_NAME, {
        query: [0.92,0.10,0.40],
        limit: 3,
        with_payload: true,
        filter: {
            must: [ // should - or condition , must-not - not condition , must - and condition , range - range condition
                {
                    key: "category",
                    match: {
                        value: "Animal"
                    }
                }
            ]
        }
    });
    console.log(JSON.stringify(results, null, 2));

}

filteredSearch();