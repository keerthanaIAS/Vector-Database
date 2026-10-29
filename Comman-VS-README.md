# Common vector-search metrics include:
1. Cosine similarity — compares the angle between vectors, largely ignoring their magnitude. Often a good choice for text and multimodal embeddings.
2. Dot product — measures alignment and vector magnitude together. Useful when the embedding model is designed for it.
3. Euclidean (L2) distance — measures straight-line distance; smaller means closer.
4. Manhattan (L1) distance — sums differences across dimensions; smaller means closer.

\\\\ For your Jina AI + Qdrant image/text search, *Cosine is a sensible default*. Qdrant also supports Euclid, Dot, and Manhattan as collection distance metrics. Note that similarity scores and distances have different directions: higher is better for similarity, while lower is better for distance. \\\\\\

The four metrics compare vectors in different ways:

| Metric | What it measures | Better match |
|---|---|---|
| **Cosine similarity** | The angle between vectors; mostly ignores their lengths | Higher score |
| **Dot product** | Directional alignment **and** vector lengths | Usually higher, if the model expects it |
| **Euclidean (L2) distance** | Straight-line distance between vectors | Lower distance |
| **Manhattan (L1) distance** | Sum of the differences in each dimension | Lower distance |

For example, compare **A = (1, 0)** with **B = (2, 0)**:

- Cosine similarity is **1**: they point in the same direction.
- Dot product is **2**: it reflects B’s greater magnitude.
- Euclidean distance is **1**.
- Manhattan distance is **1**.

So cosine treats A and B as a perfect directional match, while dot product and the distance metrics reflect that their magnitudes differ. If vectors are normalized to unit length, cosine and dot product produce equivalent rankings.

For your Jina AI image/text search, use the metric recommended for the embedding model; 
**Cosine is a common choice** when the model uses normalized embeddings.

## Think of each image or sentence as a **dot on a map**. The search compares the query’s dot with the dots already stored.

- **Cosine:** “Are they pointing in the same direction?” It focuses on whether the meaning is similar.
- **Dot product:** “Do they point the same way, and how strong are they?” It also considers vector size.
- **Euclidean:** “How far apart are the dots in a straight line?”
- **Manhattan:** “How far apart are the dots if you can only move along grid lines?”

For Cosine and Dot Product, a **higher score** usually means a better match. For Euclidean and Manhattan, a **smaller distance** means a better match.

For example, searching for a **dog image**: whichever metric Qdrant uses, it compares the search vector with the stored image vectors and ranks the closest matches. You usually don’t need to calculate these yourself—choose the metric recommended by your embedding model.

### image-upload:

Your flow is:

1. **Multer** receives the uploaded file.
2. **AWS S3** stores the image.
3. **Jina AI (`jina-clip-v2`)** turns the image into a vector (a list of numbers).
4. **Qdrant** stores that vector and uses **Cosine** to compare it with vectors from other images.

#### embedding model:

1. uses Jina AI’s jina-clip-v2 

##### In my setup:
--------------------
- Jina AI provides/runs the model.
- jina-clip-v2 converts images or text into vectors.
- Qdrant stores and searches those vectors, using Cosine.
- S3 stores the original images.
* So Jina AI is the service; jina-clip-v2 is the embedding model.

#### What is Xenova?

**Xenova** (the `@xenova/transformers` library) is a JavaScript library that loads and runs embedding models, such as `Xenova/all-MiniLM-L6-v2`, in your application. Xenova is the library, not the model or a hosted embedding service.

This is different from the S3 + Jina AI setup above: that setup calls Jina AI's hosted `jina-clip-v2` model to create image and text embeddings, which Qdrant stores and searches. Xenova is used in the separate MongoDB + Cloudinary project to generate embeddings in the application, which MongoDB Atlas stores and searches.

#### Xenova setup steps (MongoDB + Cloudinary project)

1. Install Node.js, and set up MongoDB Atlas and Cloudinary accounts.
2. Open the `MongoDB_Aggregation_Operators/image-vector-search` project folder and install its dependencies:

   ```bash
   npm install
   ```

   This project already lists `@xenova/transformers` as a dependency.
3. Create a `.env` file with the variables the project reads:

   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   DB_NAME=your_database_name
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=5000
   ```

   Keep real credentials private; `PORT` is optional and defaults to `5000`.
4. In MongoDB Atlas, create a Vector Search index on the `images` collection: set the vector path to `embedding`, dimensions to `512`, and similarity to `cosine`.
5. Start the app:

   ```bash
   npm run dev
   ```

   The app loads `Xenova/clip-vit-base-patch32` at startup. On first run, the model files are downloaded and cached locally, so the machine needs internet access. No Jina AI API key is needed for Xenova.
6. Upload images through the app. It stores the originals in Cloudinary, generates 512-dimensional embeddings with CLIP, and stores the image metadata and vectors in MongoDB. Text and image queries are also embedded with CLIP before vector search.

#### How search works (simple flow)

Think of an embedding as a list of numbers that represents what an image or sentence means. CLIP turns both pictures and text into this same kind of list, so MongoDB can compare them.

**First, save each image:**

1. You upload an image to the app.
2. Cloudinary saves the image and gives the app its URL.
3. Xenova runs the CLIP model on that image URL and creates a 512-number embedding.
4. MongoDB saves the image URL and embedding together in the `images` collection.

**Then, search with text (`POST /api/images/search/text` with `{ "text": "a dog on a beach" }`):**

1. The app gives your words to CLIP and gets a 512-number text embedding.
2. MongoDB Atlas compares that query embedding with the saved image embeddings using the `image_vector_index` Vector Search index and cosine similarity.
3. MongoDB returns the closest image matches, their URLs, and similarity scores.

**Or, search with an image (`POST /api/images/search/image`):**

1. The app uploads the query image to Cloudinary and gets its URL.
2. CLIP turns the query image into a 512-number embedding.
3. MongoDB compares it with the saved image embeddings and returns the closest matches.

In short: **CLIP/Xenova makes the number lists; MongoDB Atlas compares them; Cloudinary keeps the image files.** The text and image searches work because CLIP represents both in a shared vector space.

###### Learned these related concepts:

* Embedding model (jina-clip-v2): turns an image or text into a vector (a list of numbers).
* Similarity metric (Cosine): measures how similar two vectors are.
* ANN (Approximate Nearest Neighbor): a fast way to find vectors that are likely to be the closest matches. It may trade a little accuracy for speed.
* HNSW: one specific ANN indexing algorithm. Qdrant uses it to find nearby vectors efficiently.
* Vector database (Qdrant): stores the vectors and searches them.
* Object storage (S3): stores the original image files.