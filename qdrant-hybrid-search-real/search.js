const { QdrantClient } = require('@qdrant/js-client-rest');
const { pipeline } = require('@xenova/transformers');
require('dotenv').config();

class RealHybridSearch {
  constructor() {
    this.client = new QdrantClient({ url: process.env.QDRANT_URL });
    this.collectionName = process.env.QDRANT_COLLECTION_NAME;
    this.retrievalLimit = parseInt(process.env.RETRIEVAL_LIMIT) || 50;
  }

  async initialize() {
    this.denseModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const products = require('./products.json');
    const allText = products.map(p => 
      `${p.name} ${p.description} ${p.category}`
    ).join(' ').toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '');

    const allWords = [...new Set(allText.split(/\s+/).filter(w => w.length > 2))];

    this.vocab = {};
    this.reverseVocab = {};
    allWords.forEach((word, i) => {
      this.vocab[word] = i;
      this.reverseVocab[i] = word;
    });

    return { vocabSize: allWords.length };
  }

  generateSparseVector(text) {
    const words = text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);

    const wordCount = {};
    words.forEach(word => {
      if (this.vocab[word] !== undefined) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    const indices = [];
    const values = [];

    Object.entries(wordCount).forEach(([word, count]) => {
      indices.push(this.vocab[word]);
      values.push(Math.log(1 + count));
    });

    return { indices, values };
  }

  async rerankWithJina(query, candidates, topN) {
    if (!candidates.length) return [];

    const documents = candidates.map(c => 
      `${c.payload.name}: ${c.payload.description} [${c.payload.category}]`
    );

    try {
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

      if (result.results) {
        return result.results.map(item => ({
          ...candidates[item.index],
          hybridScore: candidates[item.index].score,
          rerankScore: item.relevance_score
        }));
      }

      throw new Error('No results from Jina');

    } catch (error) {
      return candidates.slice(0, topN).map(c => ({
        ...c,
        hybridScore: c.score,
        rerankScore: c.score
      }));
    }
  }

  async hybridSearch(denseVector, sparseVector, limit) {
    const result = await this.client.query(this.collectionName, {
      prefetch: [
        { query: denseVector, using: 'dense', limit },
        { query: sparseVector, using: 'sparse', limit }
      ],
      query: { fusion: 'rrf' },
      limit,
      with_payload: true
    });

    return result.points;
  }

  // Core search - pass pre-computed vectors to avoid duplicate work
  async search(denseVector, sparseVector, finalLimit = 5, useReranker = false) {
    const retrievalLimit = useReranker ? this.retrievalLimit : finalLimit;

    const candidates = await this.hybridSearch(denseVector, sparseVector, retrievalLimit);

    if (!candidates.length) return [];

    if (useReranker) {
      return await this.rerankWithJina(
        this._lastQuery, 
        candidates, 
        finalLimit
      );
    }

    return candidates.slice(0, finalLimit);
  }

  // Compare methods - compute embeddings ONCE
  async compareMethods(query, finalLimit = 5) {
    // Compute embeddings once
    const denseOutput = await this.denseModel(query, { pooling: 'mean', normalize: true });
    const denseVector = Array.from(denseOutput.data);
    const sparseVector = this.generateSparseVector(query);

    this._lastQuery = query;

    // Run all searches in parallel using same embeddings
    const [denseResult, sparseResult, hybridResult, rerankedResult] = await Promise.all([
      this.client.query(this.collectionName, {
        query: denseVector, using: 'dense', limit: finalLimit, with_payload: true
      }),
      this.client.query(this.collectionName, {
        query: sparseVector, using: 'sparse', limit: finalLimit, with_payload: true
      }),
      this.search(denseVector, sparseVector, finalLimit, false),
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
}

// Display logic separated from library
async function runDemo() {
  const search = new RealHybridSearch();
  const { vocabSize } = await search.initialize();
  console.log(`Model ready (vocab: ${vocabSize} words)\n`);

  const queries = [
    'running shoes for daily training',
    'professional laptop for work',
    'gaming keyboard with rgb'
  ];

  for (const query of queries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Query: "${query}"`);
    
    const results = await search.compareMethods(query, 5);
    
    console.log(`📝 Keywords: ${results.matchedWords.join(', ')}`);
    console.log(`${'='.repeat(60)}`);

    console.log('\n🧠 DENSE (Semantic):');
    results.dense.forEach((r, i) => {
      console.log(`   ${i+1}. ${r.payload.name} (${r.score.toFixed(4)})`);
    });

    console.log('\n📝 SPARSE (Keyword):');
    results.sparse.forEach((r, i) => {
      console.log(`   ${i+1}. ${r.payload.name} (${r.score.toFixed(4)})`);
    });

    console.log('\n🔀 HYBRID (RRF Fusion):');
    results.hybrid.forEach((r, i) => {
      console.log(`   ${i+1}. ${r.payload.name} (${r.score?.toFixed(4)})`);
    });

    console.log('\n🎯 RERANKED (Jina Cross-Encoder):');
    results.reranked.forEach((r, i) => {
      console.log(`   ${i+1}. ${r.payload.name} (${r.rerankScore?.toFixed(4)})`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Production Pipeline:');
  console.log(`   Qdrant (Dense + Sparse + RRF) → Top ${search.retrievalLimit}`);
  console.log('   → Jina Cross-Encoder → Final Top 5');
  console.log('='.repeat(60));
}

runDemo().catch(console.error);

//  Optimized Flow
// compareMethods() computes embeddings ONCE
//          │
//          ├──→ denseVector, sparseVector
//          │
//          ├──→ Dense search (direct)
//          ├──→ Sparse search (direct)
//          ├──→ Hybrid search (RRF) → Top 50
//          │         │
//          │         ├──→ Return top 5 as "Hybrid"
//          │         └──→ Send all 50 to Jina → Return top 5 as "Reranked"
//          │
//          └──→ All 4 results in parallel (Promise.all)