require("dotenv").config();

const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  checkCompatibility: false
});

module.exports = client;