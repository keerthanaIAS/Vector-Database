# Project Flow
Sample Data
      │
      ▼
Insert
      │
      ▼
Memory Store
      │
      ▼
Search Query
      │
      ▼
Cosine Similarity
      │
      ▼
Sort Scores
      │
      ▼
Top-K
      │
      ▼
Return Result

## Step-by-Step Practical Plan
✅ Step 1

Create sample documents

sampleData.js
✅ Step 2

Build our own vector database

vectorStore.js

This file will behave like

MongoDB Collection

or

Qdrant Collection

except it stores everything in RAM.

✅ Step 3

Insert vectors

insert.js

Exactly like

db.insertOne()

or

client.upsert()
✅ Step 4

Retrieve by ID

retrieve.js

Exactly like

findOne()

retrieve()
✅ Step 5

Update

update.js

Exactly like

updateOne()

upsert()
✅ Step 6

Delete

delete.js

Exactly like

deleteOne()
✅ Step 7

Cosine Similarity

similarity.js

We'll write the cosine similarity formula ourselves instead of relying on a library.

✅ Step 8

Search

search.js

Flow:

User Query

↓

Compare Query Vector

↓

Doc 1

↓

Doc 2

↓

Doc 3

↓

Doc 4

↓

Compute Score

This is a brute-force search.

✅ Step 9

Sort

topK.js

Flow

0.98

0.65

0.87

0.92

↓

Sort Descending

↓

0.98

0.92

0.87

↓

Return Top 3
✅ Step 10

Run Everything

app.js

Flow

Insert

↓

Retrieve

↓

Update

↓

Delete

↓

Search

↓

Top-K

### What You'll Learn

By the end of this project, you'll understand how a vector database works internally:

Insert
     │
     ▼
Store Vector
     │
     ▼
Retrieve
     │
     ▼
Update
     │
     ▼
Delete
     │
     ▼
Query Vector
     │
     ▼
Cosine Similarity
     │
     ▼
Sort
     │
     ▼
Top-K

#### Expected Output
========== MINI VECTOR DATABASE ==========

✅ Vectors Inserted Successfully

(Table showing 5 vectors)

-----------------------------

✅ Retrieved Vector

{
  id: 2,
  vector: [0.89,0.15,0.42],
  payload:{
      name:"Dog",
      category:"Animal",
      country:"USA"
  }
}

-----------------------------

✅ Vector Updated

-----------------------------

✅ Retrieved Vector

{
  id:2,
  vector:[0.99,0.12,0.40],
  payload:{
      name:"Dog Updated",
      category:"Animal",
      country:"Canada"
  }
}

##### What you've built so far
                Mini Vector DB

                  points[]

                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
   Insert        Retrieve        Update

At this point, your mini database supports:

✅ In-memory storage
✅ Insert
✅ Retrieve by ID
✅ Update

The next files (delete.js, similarity.js, topK.js, and search.js) will turn it into a real vector search engine by implementing cosine similarity and Top-K nearest-neighbor search.


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
[]
keerthana@Keerthanas-MacBook-Air mini-vector-db % mkdir db
mkdir operations
mkdir data
touch app.js
touch sampleData.js
touch README.md

touch db/vectorStore.js
touch db/similarity.js
touch db/persistence.js

touch operations/insert.js
touch operations/retrieve.js
touch operations/update.js
touch operations/delete.js
touch operations/search.js

touch data/vectors.json
keerthana@Keerthanas-MacBook-Air mini-vector-db % touch app.js
touch sampleData.js
touch vectorStore.js
touch similarity.js
touch insert.js
touch search.js
touch retrieve.js
touch update.js
touch delete.js
touch topK.js
keerthana@Keerthanas-MacBook-Air mini-vector-db % node app.js

========== MINI VECTOR DATABASE ==========

✅ Vectors Inserted Successfully

┌─────────┬────┬──────────────────────┬──────────┐
│ (index) │ id │ vector               │ payload  │
├─────────┼────┼──────────────────────┼──────────┤
│ 0       │ 1  │ [ 0.91, 0.11, 0.45 ] │ [Object] │
│ 1       │ 2  │ [ 0.89, 0.15, 0.42 ] │ [Object] │
│ 2       │ 3  │ [ 0.22, 0.81, 0.67 ] │ [Object] │
│ 3       │ 4  │ [ 0.25, 0.78, 0.69 ] │ [Object] │
│ 4       │ 5  │ [ 0.75, 0.2, 0.55 ]  │ [Object] │
└─────────┴────┴──────────────────────┴──────────┘

================ Retrieve ================

✅ Retrieved Vector

{
  id: 2,
  vector: [ 0.89, 0.15, 0.42 ],
  payload: { name: 'Dog', category: 'Animal', country: 'USA' }
}

================ Update ==================

✅ Vector Updated
✅ Retrieved Vector

{
  id: 2,
  vector: [ 0.99, 0.12, 0.4 ],
  payload: { name: 'Dog Updated', category: 'Animal', country: 'Canada' }
}

================ Delete ==================

✅ Vector 4 Deleted

================ Search ==================

┌─────────┬────┬────────────────────┬──────────┐
│ (index) │ id │ score              │ payload  │
├─────────┼────┼────────────────────┼──────────┤
│ 0       │ 2  │ 0.9993629810951139 │ [Object] │
│ 1       │ 1  │ 0.9991452985707466 │ [Object] │
│ 2       │ 5  │ 0.9715916340230817 │ [Object] │
└─────────┴────┴────────────────────┴──────────┘
keerthana@Keerthanas-MacBook-Air mini-vector-db % 

## What just happened?
                 Query Vector

             [0.90,0.10,0.40]
                     │
                     ▼
        Compare with every vector
          Cat     ✔ Score = 0.998
          Dog     ✔ Score = 0.995
          Car     ✔ Score = 0.612
          Bike    ✔ Score = 0.598
          Tiger   ✔ Score = 0.972
                     │
                     ▼
             Sort by Similarity
                     │
                     ▼
                Return Top 3

## What have you built?
                Mini Vector Database

                      │
      ┌───────────────┼────────────────┐
      │               │                │
      ▼               ▼                ▼
   Insert         Retrieve         Update
      │
      ▼
   Delete
      │
      ▼
 Cosine Similarity
      │
      ▼
 Compare Every Vector
      │
      ▼
 Sort by Score
      │
      ▼
 Return Top-K

### The limitation of this implementation

Your search algorithm is:
Query
↓
Compare with ALL vectors
↓
Sort
↓
Return Top-K

If you have:-
10 vectors → compare 10
1,000 vectors → compare 1,000
1,000,000 vectors → compare 1,000,000
100,000,000 vectors → compare 100,000,000

This is brute-force search with O(n) comparisons.

*This limitation is exactly why vector databases like Qdrant, Milvus, Weaviate, and MongoDB Atlas Vector Search build an HNSW index. Instead of comparing against every vector, they traverse a graph of nearby vectors and examine only a small subset, reducing search time dramatically while returning highly accurate nearest neighbors.*


# here we are giving in vector but user give text right?
---------------------------------------------------------
Right now, your code does this:

const queryVector = [0.90, 0.10, 0.40];
const results = search(queryVector, 3);

This assumes the user already has a vector, which is not true in real applications.

# In the Mini Vector DB

We manually provide the vector because we're learning how the search algorithm works.

User
      ↓
Already has Vector
      ↓
Mini Vector DB
      ↓
Cosine Similarity
      ↓
Results

This is only for understanding the internals.

## In a Real Application

The user provides text, an image, or audio.

Example:

* User

"I need a red sports car"

The vector database cannot understand English.

So another AI model is needed.

* User Text

"I need a red sports car"

        │
        ▼
Embedding Model
(OpenAI, CLIP, BGE, E5, Gemini...)

        │
        ▼
Vector

[0.91,0.18,0.72, ...]

        │
        ▼
Vector Database

(Qdrant)

        │
        ▼
HNSW Search

        │
        ▼
Top 5 Similar Cars

