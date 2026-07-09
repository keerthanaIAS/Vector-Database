const { QdrantClient } = require('@qdrant/js-client-rest');
const { pipeline } = require('@xenova/transformers');
const products = require('./products.json');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function seedData() {
  const client = new QdrantClient({ url: process.env.QDRANT_URL });
  const collectionName = process.env.QDRANT_COLLECTION_NAME;

  console.log('Loading model...');
  const denseModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  // Build vocabulary
  const allText = products.map(p => 
    `${p.name} ${p.description} ${p.category}`
  ).join(' ').toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '');

  const allWords = [...new Set(allText.split(/\s+/).filter(w => w.length > 2))];
  const vocab = {};
  allWords.forEach((word, i) => { vocab[word] = i; });

  // Calculate document frequencies for IDF
  const N = products.length;
  const docFreq = {};

  products.forEach(product => {
    const text = `${product.name} ${product.description} ${product.category}`;
    const words = [...new Set(text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2))];
    words.forEach(word => {
      if (vocab[word] !== undefined) {
        docFreq[word] = (docFreq[word] || 0) + 1;
      }
    });
  });

  console.log(`Vocabulary: ${allWords.length} words\n`);

  const points = [];

  for (const product of products) {
    const text = `${product.name}: ${product.description}. Category: ${product.category}`;

    // Dense embedding
    const denseOutput = await denseModel(text, { pooling: 'mean', normalize: true });
    const denseVector = Array.from(denseOutput.data);

    // TF-IDF sparse vector
    const words = text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);

    const wordCount = {};
    words.forEach(word => {
      if (vocab[word] !== undefined) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    const sparseIndices = [];
    const sparseValues = [];

    Object.entries(wordCount).forEach(([word, tf]) => {
      const df = docFreq[word] || 1;
      const idf = Math.log((N + 1) / (df + 1)) + 1;
      const weight = Math.log(1 + tf) * idf;

      sparseIndices.push(vocab[word]);
      sparseValues.push(weight);
    });

    points.push({
      id: uuidv4(),
      vector: {
        dense: denseVector,
        sparse: { indices: sparseIndices, values: sparseValues }
      },
      payload: {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price
      }
    });

    console.log(`✓ ${product.name} (${sparseIndices.length} terms)`);
  }

  await client.upsert(collectionName, { wait: true, points });
  console.log(`\n✅ Seeded ${points.length} products`);
}

seedData().catch(console.error);