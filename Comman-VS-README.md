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

###### Learned these related concepts:

* Embedding model (jina-clip-v2): turns an image or text into a vector (a list of numbers).
* Similarity metric (Cosine): measures how similar two vectors are.
* ANN (Approximate Nearest Neighbor): a fast way to find vectors that are likely to be the closest matches. It may trade a little accuracy for speed.
* HNSW: one specific ANN indexing algorithm. Qdrant uses it to find nearby vectors efficiently.
* Vector database (Qdrant): stores the vectors and searches them.
* Object storage (S3): stores the original image files.