# Qdrant Vector Database - Production-Style Project

A complete learning project for Qdrant, a dedicated vector database. This project demonstrates vector search, metadata filtering, and performance testing.

## 🚀 Quick Start

### Prerequisites
- Docker
- Node.js 18+
- npm

### Setup
```bash
# Clone and install
npm run setup

# Test connection
npm run test
```

# Key Concepts
Collection
A collection is like a table in SQL - it stores vectors and their payloads.

Point
A point is a single vector with its associated metadata (payload).

Vector
A numerical representation of data (e.g., embeddings from AI models).

Payload
Metadata attached to a vector for filtering and retrieval.

HNSW
Hierarchical Navigable Small World - an algorithm for efficient approximate nearest neighbor search.

📈 Monitoring
Access Qdrant Web UI at: http://localhost:3000

🔒 Security
For production:

Set QDRANT_API_KEY in .env

Use HTTPS

Enable authentication

Regular backups

# Complete Execution Order
1. docker compose up -d

↓

2. npm install

↓

3. npm run create

↓

4. npm run insert

↓

5. npm run collections

↓

6. npm run info

↓

7. npm run search

↓

8. npm run filter

↓

9. npm run update

↓

10. npm run search

↓

11. npm run delete

↓

12. npm run search

↓

13. npm run performance

↓

14. npm run drop

# Real Example:
Without SDK:
await fetch(
    "http://localhost:6333/collections/products",
    {
        method: "PUT",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            vectors:{
                size:3,
                distance:"Cosine"
            }
        })
    }
);
With SDK:
await client.createCollection("products", {
    vectors: {
        size: 3,
        distance: "Cosine"
    }
});

# Is the SDK another database?
No.
Node.js
      │
      ▼
Qdrant SDK
      │
      ▼
HTTP REST API
      │
      ▼
Qdrant Server
The SDK does not store data.

The SDK does not perform vector search.

The SDK only communicates with the Qdrant server.

# Another Example You Already Know

When you used MongoDB, you wrote:

const { MongoClient } = require("mongodb");

The mongodb package is the MongoDB Node.js SDK.

When you wrote:

await collection.insertOne(document);

you weren't talking directly to MongoDB. The MongoDB SDK converted that call into the MongoDB wire protocol and sent it to the server.

# Same for Qdrant
const { QdrantClient } = require("@qdrant/js-client-rest");

↓

client.upsert(...)

↓

Qdrant SDK

↓

HTTP Request

↓

Qdrant Server

# Why do SDKs exist?

Without an SDK, you would write HTTP requests for every operation.

With an SDK, you write:

client.search(...)

instead of:

fetch(...)

The SDK saves time and reduces boilerplate.

# Node version problem update node 22:
keerthana@Keerthanas-MacBook-Air qdrant-vector-db % npm run create

> qdrant-vector-db@1.0.0 create
> node scripts/createCollection.js

◇ injected env (3) from .env // tip: ⌁ auth for agents [www.vestauth.com]
◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }
[TypeError: fetch failed] {
  [cause]: InvalidArgumentError: invalid onError method
      at Agent.dispatch (/Users/keerthana/Desktop/Vector-Database/qdrant-vector-db/node_modules/undici/lib/dispatcher/dispatcher-base.js:189:15)
      at node:internal/deps/undici/undici:14357:57
      at new Promise (<anonymous>)
      at dispatchWithProtocolPreference (node:internal/deps/undici/undici:14357:18)
      at dispatch (node:internal/deps/undici/undici:14355:16)
      at httpNetworkFetch (node:internal/deps/undici/undici:14253:73)
      at httpNetworkOrCacheFetch (node:internal/deps/undici/undici:14123:39)
      at httpFetch (node:internal/deps/undici/undici:13945:43)
      at schemeFetch (node:internal/deps/undici/undici:13862:18)
      at mainFetch (node:internal/deps/undici/undici:13706:30) {
    code: 'UND_ERR_INVALID_ARG',
    Symbol(undici.error.UND_ERR): true,
    Symbol(undici.error.UND_ERR_INVALID_ARG): true
  }
}

# after node v changed log:
keerthana@Keerthanas-MacBook-Air qdrant-vector-db % rm -rf node_modules package-lock.json
keerthana@Keerthanas-MacBook-Air qdrant-vector-db % npm install                          

added 5 packages, and audited 6 packages in 1s

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities
keerthana@Keerthanas-MacBook-Air qdrant-vector-db % npm run create                       

> qdrant-vector-db@1.0.0 create
> node scripts/createCollection.js

◇ injected env (3) from .env // tip: ⌘ enable debugging { debug: true }
◇ injected env (0) from .env // tip: ⌘ custom filepath { path: '/custom/path/.env' }
✅ Collection created successfully
keerthana@Keerthanas-MacBook-Air qdrant-vector-db % npm run collections

> qdrant-vector-db@1.0.0 collections
> node scripts/listCollections.js

◇ injected env (3) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
{ collections: [ { name: 'products' } ] }
keerthana@Keerthanas-MacBook-Air qdrant-vector-db % npm run info

> qdrant-vector-db@1.0.0 info
> node scripts/collectionInfo.js

◇ injected env (3) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }
{
  status: 'green',
  optimizer_status: 'ok',
  indexed_vectors_count: 0,
  points_count: 0,
  segments_count: 5,
  config: {
    params: {
      vectors: [Object],
      shard_number: 1,
      replication_factor: 1,
      write_consistency_factor: 1,
      on_disk_payload: true
    },
    hnsw_config: {
      m: 16,
      ef_construct: 100,
      full_scan_threshold: 10000,
      max_indexing_threads: 0,
      on_disk: false
    },
    optimizer_config: {
      deleted_threshold: 0.2,
      vacuum_min_vector_number: 1000,
      default_segment_number: 0,
      max_segment_size: null,
      memmap_threshold: null,
      indexing_threshold: 10000,
      flush_interval_sec: 5,
      max_optimization_threads: null,
      prevent_unoptimized: null
    },
    wal_config: {
      wal_capacity_mb: 32,
      wal_segments_ahead: 0,
      wal_retain_closed: 1
    },
    quantization_config: null
  },
  payload_schema: {},
  update_queue: { length: 0 }
}
keerthana@Keerthanas-MacBook-Air qdrant-vector-db % 

*Notice*:
vectors_count: 0 because we haven't inserted anything yet.
size: 3 because we're using 3-dimensional vectors for learning.


# What is Upsert?

Upsert = Update + Insert

It is a single method that can perform two different actions.

Does the Point ID already exist?

          │
     ┌────┴────┐
     │         │
    No        Yes
     │         │
 Insert     Update
     │         │
     └────┬────┘
          │
       Upsert()


