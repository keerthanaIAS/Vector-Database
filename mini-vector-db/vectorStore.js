// This array acts as our database
// const vectorStore = []; // Although it's only one line, this is our entire database storage.

// module.exports = vectorStore;

// What happens internally?
// -----------------------
// When Node.js starts:
// Node.js Starts
//       │
//       ▼
// vectorStore.js Executes
//       │
//       ▼
// Creates Empty Array

// []

// Stored in RAM
// Nothing is stored on disk.

// If you stop Node.js:
// Node Stops
// ↓
// Memory Cleared
// ↓
// []

// Everything disappears.
// This is called an in-memory database.

class VectorStore {

  constructor() {
    this.points = [];
  }

  getAll() {
    return this.points;
  }

}

module.exports = new VectorStore();