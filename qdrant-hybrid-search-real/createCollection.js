const { QdrantClient } = require('@qdrant/js-client-rest');
require('dotenv').config();

async function createCollection() {
  const client = new QdrantClient({ url: process.env.QDRANT_URL });
  const collectionName = process.env.QDRANT_COLLECTION_NAME;

  try {
    await client.deleteCollection(collectionName);
    console.log(`Deleted existing collection: ${collectionName}`);
  } catch (error) {}

  await client.createCollection(collectionName, {
    vectors: {
      dense: { size: 384, distance: 'Cosine' }
    },
    sparse_vectors: {
      sparse: {}
    }
  });

  console.log(`✅ Collection created: ${collectionName}`);
  console.log('   - Dense: 384d (all-MiniLM-L6-v2)');
  console.log('   - Sparse: Vocabulary-based');
}

createCollection().catch(console.error);