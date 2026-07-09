# Built
A production-style product search system that combines semantic understanding (dense vectors) with keyword matching (sparse vectors) using Qdrant's native hybrid search capabilities.

## Tech Stack
Node.js + @qdrant/js-client-rest + @xenova/transformers
Qdrant (Docker) + all-MiniLM-L6-v2 (dense) + SPLADE-style sparse

### Architecture
User Query: "running shoes"
         │
         ▼
   Generate Embeddings
         │
    ┌────┴────┐
    │         │
Dense Vector  Sparse Vector
[0.12, -0.34,  {5: 2.3,
 0.56, ...]    42: 1.8, ...]
    │         │
    └────┬────┘
         │
    query_points()
         │
      Prefetch
    ┌────┴────┐
    │         │
Dense Search  Sparse Search
(Semantic)    (Keyword)
    │         │
    └────┬────┘
         │
    RRF Fusion
         │
   Hybrid Results

#### Key Components
1. Dense Vectors (Semantic Search)
- 384-dimensional vectors from all-MiniLM-L6-v2
- Captures meaning: "running shoes" ≈ "athletic footwear"
- Uses Cosine similarity

2. Sparse Vectors (Keyword Search)
- Token importance scores from BERT
- Captures exact words: "Nike" = "Nike"
- Only 20-100 non-zero values out of thousands

3. RRF Fusion (Reciprocal Rank Fusion)
- Combines rankings from both searches
- Formula: score = 1/(k + rank)
- Higher rank in either search = higher final score

4. Prefetch
- Runs both searches in parallel inside Qdrant
- Single API call, not two separate searches

##### How It Works
Indexing (seed.js):
For each product:
  1. Generate dense vector (semantic meaning)
  2. Generate sparse vector (keyword importance)
  3. Upload both to Qdrant in single point
Searching (search.js):
For each query:
  1. Generate dense + sparse vectors
  2. Single query_points() call with:
     - Prefetch: [dense_search, sparse_search]
     - Fusion: 'rrf'
  3. Get combined, ranked results

###### Understand
- Dense vectors = Semantic/meaning search
- Sparse vectors = Keyword/exact match search
- Prefetch = Parallel search branches
- RRF Fusion = Smart ranking combination
- Single API call = Everything happens in Qdrant
- Real embeddings = Neural network outputs, not random numbers


# What Does What?
User Query: "running shoes"
         │
         ▼
      PREFETCH (runs searches in parallel)
    ┌────────────────┐
    │ Dense Search   │──► Returns: [Adidas, Nike, Puma]
    │ Sparse Search  │──► Returns: [Nike, Reebok, Adidas]
    └────────────────┘
         │
         ▼
      RRF FUSION (re-ranks/merges results)
         │
    Combines rankings using formula:
    score = 1/(60 + rank)
         │
         ▼
    Final: [Nike (0.032), Adidas (0.031), Puma (0.016), Reebok (0.015)]

## Add Reranker to Our Hybrid Search
Query
  │
  ▼
Generate Dense + Sparse Embeddings
  │
  ▼
PREFETCH (parallel)
  ├── Dense Search → Top 20
  └── Sparse Search → Top 20
  │
  ▼
RRF FUSION (merge & re-rank)
  │
  ▼
Top 10 Candidates
  │
  ▼
RERANKER (cross-encoder)
  │
  ▼
Final Top 3 Results

# Advance search vs simple search files what do:
🔍 Step 1: Hybrid Search for "comfortable running shoes..."
✅ Retrieved 10 candidates after fusion

🎯 Step 2: Reranking 10 candidates...
  ✓ Scored: Nike Air Zoom
  ✓ Scored: Nike Running Shoes
  ✓ Scored: Adidas Ultraboost
  ...

📊 COMPARISON
✅ WITH Reranker:     Nike Running Shoes → Adidas Ultraboost → Nike Air Zoom
❌ WITHOUT Reranker:  Adidas Ultraboost → Nike Air Zoom → Nike Running Shoes
Order Changed: YES ✅

## Key Benefits of Reranker
- Deeper understanding: Reads full query+document pair
- Better ordering: Understands nuance better than RRF alone
- Relevance scoring: Binary relevant/not-relevant per document
- Trade-off: Slower but more accurate

# Pipeline:
User Query
      │
      ▼
Embedding Model
      │
      ▼
Qdrant
(Dense + Sparse + RRF)
      │
Top 20–100 candidates
      ▼
Jina AI Reranker
      │
Top 5
      ▼
LLM (optional)

# Summary:
Dense embeddings → Sparse retrieval → Hybrid fusion (RRF) → Cross-encoder reranking (Jina AI).

## How They Work Together:
Query: "running shoes"

┌─────────────────────────────────────────────┐
│ MINILM (Local)                              │
│ "running shoes" → [384 numbers]             │
│ → Semantic: finds meaning-based matches     │
│ → Finds: Adidas Ultraboost (running shoe)   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ TF-IDF (Local Math)                         │
│ "running shoes" → {running: 0.5, shoes: 0.5}│
│ → Keyword: finds exact word matches         │
│ → Finds: Nike Running Shoes (has "running")  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ QDRANT RRF (Local)                          │
│ Combines both rankings                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ JINA AI (Cloud API)                         │
│ Deep reads query + each document            │
│ → Final accurate ranking                    │
└─────────────────────────────────────────────┘

1. MiniLM = Local brain for understanding meaning
2. TF-IDF = Smart word counter for keyword matching
3. Qdrant RRF = Smart merger of both results
4. Jina AI = Cloud expert for final ranking

*Xenova = The Engine, MiniLM = The Model*

┌─────────────────────────────────────────────┐
│ XENOVA (JavaScript Library)                 │
│                                             │
│ import { pipeline } from '@xenova/...'      │
│                                             │
│ ┌─────────────────────────────────┐         │
│ │ MINILM (The Model)              │         │
│ │ all-MiniLM-L6-v2                │         │
│ │                                 │         │
│ │ Text → 384 numbers              │         │
│ └─────────────────────────────────┘         │
│                                             │
│ Xenova loads & runs MiniLM                  │
└─────────────────────────────────────────────┘

# Complete Picture:
Query: "running shoes"
         │
         ▼
┌────────────────────────────────────────────┐
│ XENOVA (loads & runs the model)            │
│                                            │
│ ┌──────────┐    ┌──────────┐              │
│ │ MiniLM   │    │ TF-IDF   │              │
│ │ Model    │    │ Math     │              │
│ │          │    │          │              │
│ │ 384 dims │    │ {word:   │              │
│ │ vector   │    │  weight} │              │
│ └────┬─────┘    └────┬─────┘              │
└──────┼──────────────┼──────────────────────┘
       │              │
       ▼              ▼
   Dense Vector   Sparse Vector
       │              │
       └──────┬───────┘
              ▼
      QDRANT (RRF Fusion)
              │
              ▼
      Top Candidates
              │
              ▼
      JINA AI (Reranker)
              │
              ▼
      Final Results

# Code:
// Xenova is the LIBRARY you imported
const { pipeline } = require('@xenova/transformers');

// MiniLM is the MODEL you load through Xenova
this.denseModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
//                 ^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                 Xenova function            MiniLM model name

// TF-IDF is just MATH - no library needed
const weight = Math.log(1 + tf) * idf;
*Xenova = The tool that runs MiniLM on your machine!*

*Qdrant does bulk retrieval, Jina only sees top candidates*

Qdrant retrieves: 15 candidates
         │
         ▼
Take top 10 (not all 15)
         │
         ▼
Send only 10 to Jina API
         │
         ▼
Jina returns top 5 reranked
         │
         ▼
Final results: 5


---------------------------------------------------- *README* ----------------------------------------------------
# Architecture Overview
User Query: "running shoes for athletes"
         │
         ▼
┌─────────────────────────────────────────┐
│  MiniLM (via Xenova Transformers)       │
│  Text → 384-dimensional dense vector    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  TF-IDF (Custom Math)                   │
│  Text → {word: weight} sparse vector    │
└─────────────────────────────────────────┘
         │
         ├── Dense Vector [0.12, -0.34, ...]
         └── Sparse Vector {running: 0.5, shoes: 0.5}
                │
                ▼
┌─────────────────────────────────────────┐
│  Qdrant Hybrid Search                   │
│  query() with prefetch + RRF fusion     │
│  Retrieves Top 50 candidates            │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Jina AI Cross-Encoder Reranker         │
│  jina-reranker-v2-base-multilingual     │
│  Deep reads query + each document       │
│  Returns reranked Top 5                 │
└─────────────────────────────────────────┘

## Technologies Used
| Technology          | Purpose                                      | Type                 | Cost      |
| ------------------- | -------------------------------------------- | -------------------- | --------- |
| Xenova Transformers | JavaScript ML library                        | Local                | Free      |
| all-MiniLM-L6-v2    | Dense embeddings (384 dimensions)            | Local Model          | Free      |
| TF-IDF (Custom)     | Sparse keyword vectors                       | Local Algorithm      | Free      |
| Qdrant              | Vector database + Hybrid Search (RRF Fusion) | Docker / Self-hosted | Free      |
| Jina AI Reranker    | Cross-encoder reranker                       | Cloud API            | Free Tier |

### Key Concepts
Dense Vectors (MiniLM)
// What: Semantic understanding
// How: Converts text → 384 numbers
"running shoes" → [0.12, -0.34, 0.56, ...]

// Use: Find meaning-based matches
// Code: pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

Sparse Vectors (TF-IDF)
// What: Keyword matching with importance weights
// How: Counts words, weights rare words higher
"running shoes" → {running: 0.5, shoes: 0.5}

// Formula:
TF = term frequency in document
IDF = log((total_docs + 1) / (docs_with_term + 1)) + 1
Weight = log(1 + TF) * IDF
// Use: Find exact word matches

RRF Fusion (Reciprocal Rank Fusion)
// What: Combines dense + sparse rankings
// Formula: score = 1 / (k + rank)
// k = 60 (constant)
// Qdrant does this natively:
query: { fusion: 'rrf' }

Cross-Encoder Reranker (Jina AI)
// What: Deep reads query + document together
// vs Bi-Encoder: Reads query and document separately

// Bi-Encoder (Fast):
query → [vector]  ───cosine─── [vector] ← document

// Cross-Encoder (Accurate):
[query + document] → Model → relevance score (0-1)

#### Project Structure
text
qdrant-hybrid-search-real/
├── docker-compose.yml      # Qdrant container
├── package.json            # Dependencies
├── .env                    # API keys & config
├── products.json           # Sample product data
├── createCollection.js     # Setup Qdrant collection
├── seed.js                 # Generate & upload embeddings
└── search.js              # Hybrid search implementation
🚀 Setup & Run
1. Install Dependencies
bash
npm install @xenova/transformers @qdrant/js-client-rest dotenv uuid
2. Environment Variables (.env)
env
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=products_hybrid_real
JINA_API_KEY=jina_your_api_key_here
RETRIEVAL_LIMIT=50
3. Start Qdrant
bash
docker-compose up -d
4. Run Pipeline
bash
node createCollection.js   # Create collection
node seed.js               # Upload product embeddings
node search.js             # Run hybrid search

##### Code Reference - Line by Line
1. createCollection.js
// Create collection with dense + sparse vector support
await client.createCollection(collectionName, {
  vectors: {
    dense: { size: 384, distance: 'Cosine' }  // Dense vector config
  },
  sparse_vectors: {
    sparse: {}  // Enable sparse vectors
  }
});

2. seed.js - Vocabulary Building
// Build vocabulary from all products
const allWords = [...new Set(allText.split(/\s+/).filter(w => w.length > 2))];

// Map each word to a unique index
const vocab = {};
allWords.forEach((word, i) => { vocab[word] = i; });

3. seed.js - TF-IDF Calculation
// Document frequency: how many docs contain each word
const docFreq = {};
products.forEach(product => {
  const words = getUniqueWords(product);
  words.forEach(word => {
    docFreq[word] = (docFreq[word] || 0) + 1;
  });
});

// TF-IDF weight for each word
Object.entries(wordCount).forEach(([word, tf]) => {
  const df = docFreq[word] || 1;
  const idf = Math.log((N + 1) / (df + 1)) + 1;
  const weight = Math.log(1 + tf) * idf;
  
  sparseIndices.push(vocab[word]);
  sparseValues.push(weight);
});

4. seed.js - Upload to Qdrant
// Each point has both dense and sparse vectors
points.push({
  id: uuidv4(),
  vector: {
    dense: denseVector,           // [0.12, -0.34, ...] 384 numbers
    sparse: {                     // {indices: [5,12], values: [0.5,0.3]}
      indices: sparseIndices,
      values: sparseValues
    }
  },
  payload: {
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price
  }
});

await client.upsert(collectionName, { wait: true, points });

5. search.js - Sparse Vector Generation
generateSparseVector(text) {
  const words = text.toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);

  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    if (this.vocab[word] !== undefined) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });

  // Convert to Qdrant sparse format
  const indices = [];
  const values = [];
  Object.entries(wordCount).forEach(([word, count]) => {
    indices.push(this.vocab[word]);    // Word → index mapping
    values.push(Math.log(1 + count));  // TF weighting
  });

  return { indices, values };
}

6. search.js - Qdrant Hybrid Query
// Native hybrid search with prefetch + RRF
async hybridSearch(denseVector, sparseVector, limit) {
  const result = await this.client.query(this.collectionName, {
    prefetch: [
      { query: denseVector, using: 'dense', limit },
      { query: sparseVector, using: 'sparse', limit }
    ],
    query: { fusion: 'rrf' },  // Built-in RRF fusion
    limit,
    with_payload: true
  });
  return result.points;
}

7. search.js - Jina Reranker API Call
async rerankWithJina(query, candidates, topN) {
  if (!candidates.length) return [];

  // Prepare documents for reranking
  const documents = candidates.map(c => 
    `${c.payload.name}: ${c.payload.description} [${c.payload.category}]`
  );

  // Call Jina AI API with timeout
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 10000);

  const response = await fetch('https://api.jina.ai/v1/rerank', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'jina-reranker-v2-base-multilingual',
      query: query,
      documents: documents,
      top_n: topN
    }),
    signal: controller.signal
  });

  if (!response.ok) {
    throw new Error(`Jina API returned ${response.status}`);
  }

  const result = await response.json();
  
  // Map results back to original candidates
  return result.results.map(item => ({
    ...candidates[item.index],
    hybridScore: candidates[item.index].score,
    rerankScore: item.relevance_score
  }));
}

8. search.js - Main Search Method
async search(denseVector, sparseVector, finalLimit = 5, useReranker = false) {
  // If reranking: get more candidates for reranker to choose from
  // If not: get exactly what we need
  const retrievalLimit = useReranker ? this.retrievalLimit : finalLimit;

  // Step 1: Get candidates from Qdrant
  const candidates = await this.hybridSearch(
    denseVector, sparseVector, retrievalLimit
  );

  if (!candidates.length) return [];

  // Step 2: Rerank if requested
  if (useReranker) {
    return await this.rerankWithJina(query, candidates, finalLimit);
  }

  return candidates.slice(0, finalLimit);
}

9. search.js - Compare All Methods
async compareMethods(query, finalLimit = 5) {
  // Compute embeddings ONCE (not 3 times)
  const denseOutput = await this.denseModel(query, { 
    pooling: 'mean', normalize: true 
  });
  const denseVector = Array.from(denseOutput.data);
  const sparseVector = this.generateSparseVector(query);

  // Run all 4 searches in parallel
  const [denseResult, sparseResult, hybridResult, rerankedResult] = 
    await Promise.all([
      // Dense only
      this.client.query(this.collectionName, {
        query: denseVector, using: 'dense', limit: finalLimit, with_payload: true
      }),
      // Sparse only
      this.client.query(this.collectionName, {
        query: sparseVector, using: 'sparse', limit: finalLimit, with_payload: true
      }),
      // Hybrid (RRF)
      this.search(denseVector, sparseVector, finalLimit, false),
      // Hybrid + Reranker
      this.search(denseVector, sparseVector, finalLimit, true)
    ]);

  return {
    dense: denseResult.points,
    sparse: sparseResult.points,
    hybrid: hybridResult,
    reranked: rerankedResult,
    matchedWords: sparseVector.indices.map(i => this.reverseVocab[i])
  };
}

###### Understanding Output Scores
// Dense scores: Cosine similarity (-1 to 1)
Nike Running Shoes: 0.7133  // Higher = more similar meaning

// Sparse scores: TF-IDF dot product (varies)
Mechanical Keyboard: 5.4118  // Higher = more keyword matches

// RRF scores: Fusion ranks (standard values)
1st place: 1.0000
2nd place: 0.6667
3rd place: 0.5000

// Reranker scores: Cross-encoder relevance (0 to 1)
Nike Running Shoes: 0.982  // Higher = more relevant to query

###### Configuration Options
javascript
// Retrieval limit (default: 50)
this.retrievalLimit = parseInt(process.env.RETRIEVAL_LIMIT) || 50;

// Reranker timeout (default: 10s)
setTimeout(() => controller.abort(), 10000);

// Final results limit
search(query, finalLimit = 5, useReranker = true)

// RRF constant
score = 1 / (60 + rank)  // k = 60

###### Production Checklist
| Feature                           | Status | Implementation                                              |
| --------------------------------- | ------ | ----------------------------------------------------------- |
| Dense Embeddings                  | ✅      | `pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')` |
| Sparse TF-IDF Vectors             | ✅      | `Math.log(1 + tf)` (custom sparse vector generation)        |
| Qdrant Native RRF Fusion          | ✅      | `query: { fusion: 'rrf' }`                                  |
| Parallel Dense + Sparse Retrieval | ✅      | `prefetch: [dense, sparse]`                                 |
| Jina AI Cross-Encoder Reranker    | ✅      | `fetch('https://api.jina.ai/v1/rerank')`                    |
| Request Timeout                   | ✅      | `AbortController`                                           |
| HTTP Error Handling               | ✅      | `if (!response.ok)`                                         |
| Empty Results Handling            | ✅      | `if (!candidates.length)`                                   |
| Configurable Retrieval Limit      | ✅      | `RETRIEVAL_LIMIT` environment variable                      |
| Single Embedding Computation      | ✅      | Compute embeddings once in `compareMethods()`               |
| Parallel Search Execution         | ✅      | `Promise.all()`                                             |
| Fallback on Jina API Failure      | ✅      | Return hybrid search results when reranking fails           |

*RRF (Reciprocal Rank Fusion)* --> A rank fusion algorithm that combines results from multiple search methods based on their ranking positions instead of their raw scores.
* Purpose --> Merges dense (semantic) and sparse (keyword) search results into a single ranked list.
* Formula --> RRF Score = Σ 1 / (k + rank)
* In your Qdrant code:
query: {
    fusion: 'rrf'
}
Qdrant automatically computes the RRF score and returns the fused ranking. You don't implement the formula yourself; Qdrant does it internally.

###### Key Takeaways
Dense = Semantic understanding (meaning)
Sparse = Keyword matching (exact words)
RRF = Smart ranking combination
Prefetch = Parallel search branches in Qdrant
Cross-encoder = Deep query-document comparison
Retrieval → Rerank = Standard production pattern

# simple terms:
| Step | What You Did                                              | Purpose                                                                 |
| ---- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1    | Loaded the **MiniLM** model using Xenova                  | Convert the user's query into a dense embedding.                        |
| 2    | Created a **TF-IDF-like sparse vector** from the query    | Represent important keywords.                                           |
| 3    | Stored **dense vectors** and **sparse vectors** in Qdrant | Make both semantic and keyword search possible.                         |
| 4    | Sent both vectors to Qdrant using **prefetch**            | Perform dense and sparse search in parallel.                            |
| 5    | Used **RRF Fusion**                                       | Combine the dense and sparse search results into one ranking.           |
| 6    | Retrieved the **Top 50** hybrid candidates                | Get the best candidates before reranking.                               |
| 7    | Sent those candidates to **Jina AI Cross-Encoder**        | Let the reranker compare the query with each candidate more accurately. |
| 8    | Received the **Top 5 reranked results**                   | Return the most relevant results to the user.                           |

## complete pipeline:
User Query
      │
      ▼
MiniLM (Dense Embedding)
      │
      ├──────────────┐
      │              │
      ▼              ▼
Dense Vector    Sparse TF-IDF Vector
      │              │
      └──────┬───────┘
             ▼
      Qdrant Prefetch
(Dense Search + Sparse Search)
             │
             ▼
        RRF Fusion
             │
             ▼
     Top 50 Candidates
             │
             ▼
 Jina AI Cross-Encoder Reranker
             │
             ▼
      Final Top 5 Results

*prefetch does NOT combine the results.*

* prefetch only executes multiple searches first (dense and sparse) and collects their result lists.                     -->*important notes*
* Then RRF combines those lists into a single ranking.

* The flow:
User Query
      │
      ▼
Generate Dense Vector
Generate Sparse Vector
      │
      ▼
      Prefetch
   ┌───────────────┐
   │               │
Dense Search   Sparse Search
   │               │
   └──────┬────────┘
          ▼
     Two Result Lists
          │
          ▼
     RRF Fusion
          │
          ▼
 Single Hybrid Ranking
          │
          ▼
 Top 50 Candidates
          │
          ▼
 Jina Reranker
          │
          ▼
 Final Top 5 Results

✅ Prefetch = runs dense search and sparse search in parallel.
✅ RRF = combines the two result lists into one hybrid ranking.
✅ Jina Reranker = reorders the top candidates from that hybrid ranking to produce the final results.

# check log:
keerthana@Mac qdrant-hybrid-search-real % node -e "const { QdrantClient } = require('@qdrant/js-client-rest'); const c = new QdrantClient({url:'http://localhost:6333'}); console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(c)).filter(m => m.includes('uery') || m.includes('earch')))"
[
  'searchBatch',
  'search',
  'searchPointGroups',
  'query',
  'queryBatch',
  'queryGroups',
  'searchMatrixPairs',
  'searchMatrixOffsets'
]
docker compose up -d
node createCollection.js
node seed.js
node search.js
