# Vector-Database

## Why were Vector Databases created?

Imagine you have 100 million embeddings.

Without a vector database:
Query
↓
Compare with Vector 1
↓
Compare with Vector 2
↓
Compare with Vector 3
↓
...
↓
Compare with Vector 100,000,000

This is *Brute Force Search*.

Time complexity:
O(n)
As n grows, search becomes slower.

Vector databases solve this by *building indexes such as HNSW, IVF, or DiskANN* so they don't need to compare every vector.

### What is a Dedicated Vector Database?

A vector database is built primarily for vectors.

It stores data like:
{
   "id": 101,
   "embedding": [0.22,0.55,0.11,...],
   "metadata": {
      "category":"Shoes",
      "brand":"Nike"
   }
}

The most important part is the *embedding*, because similarity search is the main workload.

### MongoDB vs Vector Database
| Feature                           | MongoDB                               | Dedicated Vector Database                               |
| --------------------------------- | ------------------------------------- | ------------------------------------------------------- |
| Primary purpose                   | General document database             | Similarity search on embeddings                         |
| Stores JSON documents             | ✅                                     | ✅ (often with metadata)                                 |
| CRUD operations                   | ✅                                     | ✅                                                       |
| Transactions                      | ✅                                     | Some support, some don't                                |
| Aggregation                       | ✅                                     | Limited compared to MongoDB                             |
| Replica Sets                      | ✅                                     | Depends on the product                                  |
| Sharding                          | ✅                                     | Usually supported                                       |
| Vector Search                     | ✅                                     | ✅                                                       |
| Optimized for billions of vectors | Good, but not the primary design goal | Yes, this is the primary design goal                    |
| Multiple ANN indexes              | Limited                               | Usually supports several (HNSW, IVF, PQ, DiskANN, etc.) |

#### When should you use MongoDB?

Use MongoDB when your application needs to manage general business data.

Example:
E-commerce

If you also need semantic search, MongoDB's vector search can often be added without introducing another database.

#### When should you use a Dedicated Vector Database?

Use one when the main challenge is vector similarity at large scale.

Examples:
- Chatbot knowledge retrieval (RAG)
- Recommendation systems
- Image similarity search
- Face recognition
- Audio search
- Video search
- Scientific embedding search
- Large-scale semantic document search

These workloads may involve tens or hundreds of millions of vectors.

##### Advantages of a Vector Database

* Instead of:
100 Million Vectors
↓

Compare 100 Million

* It performs:
100 Million Vectors
↓
Vector Index (HNSW / IVF)
↓
Compare a Small Candidate Set
↓
Top-K Results

Benefits:
- Faster semantic search
- Scales to very large datasets
- Optimized memory usage
- Supports approximate nearest neighbor (ANN) algorithms
- Can combine metadata filtering with vector search
- Often supports multiple indexing strategies for different workloads

# Are MongoDB and a Vector Database the same?
--------------------------------------------------------
No.
- MongoDB is a General-Purpose Database that supports Vector Search.
- A dedicated vector database is built primarily for vector operations.

## Think of it like this.
*MongoDB*:
                    MongoDB

          Stores Everything

      Users
      Orders
      Products
      Payments
      Logs
      Sessions
      Images
      Documents
      Embeddings (Vector Search)

        Vector Search is ONE feature

- MongoDB's primary job is managing application data.

*Dedicated Vector Database*:
                Vector Database

        Main Purpose

        Store Embeddings
              │
              ▼
      Fast Similarity Search
              │
              ▼
     HNSW / IVF / PQ / DiskANN
              │
              ▼
      Return Similar Documents

- Everything is optimized around vectors.

### Example Architecture:
               User

                 │

      Search "Red Sports Shoes"

                 │

                 ▼

        Application Server

        ┌───────────────┐
        │               │
        ▼               ▼

   MongoDB         Vector Database

Users             Product Embeddings
Orders            Similar Products
Payments          Image Embeddings
Products          Recommendation Search



# Practical 1: Mini Vector Database:
                    Mini Vector Database

          Insert Data
               │
               ▼
       Store Embeddings
               │
               ▼
      Maintain Vector Store
               │
               ▼
         Receive Query
               │
               ▼
      Find Similar Vectors
               │
               ▼
        Return Top Results

* Notice something.

There is no:
MongoDB
Atlas
HNSW
ANN
Index

We're first building the brain of a vector database.

## Real Vector Database Architecture:
- Before coding, understand what every vector database contains.
                 Vector Database

        ┌─────────────────────────┐
        │ Insert Document         │
        └──────────┬──────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │ Store Metadata          │
        └──────────┬──────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │ Store Embedding          │
        └──────────┬──────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │ Search Engine           │
        └──────────┬──────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │ Return Top-K            │
        └─────────────────────────┘
- Our first practical will implement exactly these components.

1. Step 1 — Data Model
2. Step 2 — Storage
Instead of MongoDB, we'll use memory.
3. Step 3 — Insert Operation
Every vector database supports insertion.
4. Step 4 — Search
5. Step 5 — Similarity Comparison
For the first version, we'll compare the query with every stored vector.
6. Step 6 — Ranking
Now we sort.
7. Step 7 — Return Top-K

* Complete Flow:-
Insert Document
       │
       ▼
Generate Embedding
       │
       ▼
Store in Memory
       │
       ▼
Receive Query
       │
       ▼
Generate Query Embedding
       │
       ▼
Compare with Stored Vectors
       │
       ▼
Calculate Similarity
       │
       ▼
Sort by Score
       │
       ▼
Return Top-K

### Where is the "Vector Database"?
- Everything together is the vector database.
                 Mini Vector Database

            +----------------------+
            | Vector Store         |
            +----------------------+

            +----------------------+
            | Insert Engine        |
            +----------------------+

            +----------------------+
            | Search Engine        |
            +----------------------+

            +----------------------+
            | Similarity Engine    |
            +----------------------+

            +----------------------+
            | Ranking Engine       |
            +----------------------+

#### Build the Database (vectorStore.js):
*Think First*:

* In MongoDB:
Collection
    │
    ▼
Documents

Example:
db.products.find()

- The collection internally stores all documents.

* In our Vector Database:
Vector Database
       │
       ▼
Vector Store
       │
       ▼
Documents + Embeddings

- We don't have MongoDB.
- So where do we store the data?
- Inside memory (RAM).

Think of it like this:
Memory (RAM)

vectorStore
┌─────────────────────────────┐
Document 1
Document 2
Document 3
Document 4
└─────────────────────────────┘

# Terminal log:
keerthana@Keerthanas-MacBook-Air Vector-Database % mkdir mini-vector-db
cd mini-vector-db

npm init -y
Wrote to /Users/keerthana/Desktop/Vector-Database/mini-vector-db/package.json:

{
  "name": "mini-vector-db",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs"
}


keerthana@Keerthanas-MacBook-Air mini-vector-db % node app.js
[]                                                                                              -->*Because no data has been inserted yet.*
keerthana@Keerthanas-MacBook-Air mini-vector-db %  


# Database Analogy:
| MongoDB    | Our Mini Vector DB  |
| ---------- | ------------------- |
| Database   | Node.js Application |
| Collection | `vectorStore` array |
| Document   | JavaScript Object   |
| Insert     | `push()`            |
| Find       | Search function     |
| Storage    | RAM (for now)       |

