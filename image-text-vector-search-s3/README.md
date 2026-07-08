Project 1
---------
MongoDB + Cloudinary + Xenova

Project 2
---------
S3 + Jina AI + Qdrant

# Internal Architecture
                 S3
                  │
      stores original image
                  │
                  ▼
        https://bucket/cat.jpg
                  │
                  ▼
             Jina AI
                  │
        creates embedding
                  │
                  ▼
      [0.24,-0.12,0.88...]
                  │
                  ▼
             Qdrant
                  │
      stores vector + payload

# What each folder does
| Folder      | Purpose                           |
| ----------- | --------------------------------- |
| config      | qdrant, S3 configuration         |
| controllers | API logic                         |
| routes      | API endpoints                     |
| services    | Upload, embedding, database logic |
| uploads     | Temporary uploaded files          |
| models      | Data schemas or helper classes    |

# Why do we need S3?
Suppose a user uploads an image.

* Without S3:
User
↓
Node Server
↓
Local Folder
↓
image.jpg

What happens if your server crashes?
Everything is lost.

With S3:
User
↓
Node
↓
Amazon S3
↓
Cloud Storage
↓
Permanent URL

The server can restart, scale, or be replaced without losing the uploaded files.

# What is an S3 Bucket?
Think of your laptop.

Desktop
Projects
Photos
Downloads
- A bucket is similar to a top-level folder in the cloud.

Example:
Bucket
holiday-images

Inside:
cat.jpg
dog.jpg
car.png

# What is an Object?
In S3, everything is an object.

An object contains:
Image
+
File Name
+
Metadata
+
Permission
+
Storage Information

Example:
cat.jpg 

- Internally, S3 stores more than just the bytes—it stores metadata and access information too.

Bucket Names
Bucket names must be globally unique.

❌ Invalid
images
✅ Better
keerthana-vector-search-demo
or
ks-image-search-2026

- because no one else in AWS can already be using the same bucket name.

# Step 8: Test Using Postman

Method:
POST

URL:
http://localhost:5000/api/upload

Body:
form-data
Key:
image
Type:
File
Choose any JPG or PNG.

* Expected Response
{
  "success": true,
  "imageUrl": "https://your-bucket.s3.ap-south-1.amazonaws.com/xxxxxxxx-cat.jpg"
}

What Happens Internally?
User
↓
POST /upload
↓
Express
↓
Multer
↓
req.file.buffer
↓
PutObjectCommand
↓
S3 Bucket
↓
Image Stored
↓
Image URL Returned

# What Learned Today
- How Express receives file uploads.
- Why Multer uses memoryStorage() for direct S3 uploads.
- How S3Client authenticates with AWS using IAM credentials.
- How PutObjectCommand uploads an object to an S3 bucket.
- Why unique filenames (UUIDs) prevent accidental overwrites.
- How an uploaded file becomes a publicly addressable S3 object (or later, a private object accessed through pre-signed URLs).

# Don't use ONNX Runtime directly (for this project)

onnxruntime-node is only an inference engine. It does not:

Download the model
Preprocess images
Tokenize text
Normalize inputs
Convert images to tensors

You would need to manually:

Download the CLIP ONNX model
Download processor files
Resize images
Center crop
Normalize RGB channels
Convert to tensors
Handle model inputs/outputs

That's a lot of low-level work and distracts from learning vector search.

# Better Alternative
Since you've already used Xenova, let's use a completely different embedding service.

We'll use:
Jina AI Embeddings API

Advantages:
- Different from Xenova
- No Python
- No Hugging Face runtime
- No ONNX setup
- Supports image embeddings
- Production-ready API
- Free tier available

### Create a Free Jina AI Account
Go to:
- Jina AI Dashboard
- Create an account.
- Generate an API key.

# Insert Image into Qdrant

Current flow:
User
   │
   ▼
Upload Image
   │
   ▼
S3
   │
   ▼
Pre-signed URL
   │
   ▼
Jina AI
   │
   ▼
Embedding

Now add:
Embedding
    │
    ▼
Qdrant Upsert

# Why AWS S3?
Images should not be stored inside the vector database.

S3 provides:
- Scalable object storage
- High durability
- Cost-effective storage
- Secure access using IAM
- Pre-Signed URL support

# Why Pre-Signed URLs?
The S3 bucket is private.

- Instead of making images public, the backend generates a *temporary URL with read permission*.

Example:
https://bucket.s3.amazonaws.com/cat.jpg
?X-Amz-Algorithm=...

Benefits:-
- Bucket remains private
- Temporary access
- Secure image sharing
- URL expires automatically

# Why Store Only the S3 Object Key?
Instead of storing:
https://bucket.s3.amazonaws.com/cat.jpg

store only:
467f5731-white-cat.jpg

During search:
Qdrant
↓
Returns Object Key
↓
Generate New Pre-Signed URL
↓
Return Image

Advantages:
- URLs never expire in the database
- Less storage
- Better security
- Standard production approach

# Why Qdrant?
Qdrant is a specialized Vector Database designed for semantic search.

It stores:-
Vector Embeddings
Metadata (Payload)

Example:-
Vector
[0.11,
-0.32,
0.82,
...]
Payload
{
    "key":"cat.jpg",
    "createdAt":"..."
}

# Why Jina AI?
Jina AI provides multimodal embeddings.

It converts:-
Images
↓
Vectors
and
Text
↓
Vectors
- Because both vectors exist in the same vector space, we can perform
Image → Image Search
Text → Image Search

## Step 1 — What is Upsert?

Unlike MongoDB:
insertOne()

Qdrant uses:
upsert()

Why?
Because it means:

If Point Exists
      │
      ▼
Update

Else
Insert

- So one API does both.

## Step 2 — What is a Point?
MongoDB stores
{
   "_id": "...",
   "name": "Cat"
}

Qdrant stores
{
   "id": "123",
   "vector": [0.22, -0.13, ...],
   "payload": {
      "imageUrl": "...",
      "fileName": "cat.jpg"
   }
}

### Notice the terminology:
| MongoDB    | Qdrant     |
| ---------- | ---------- |
| Document   | Point      |
| Fields     | Payload    |
| Collection | Collection |
| _id        | id         |
| insertOne  | upsert     |

## What does Qdrant actually do?
Suppose your collection contains:
Cat
Dog
Tiger
Car
Beach

Internally:
Cat
↓
[0.11,0.24,-0.55]
Dog
↓
[0.14,0.20,-0.52]
Car
↓
[-0.71,0.82,0.11]

Query
New Dog Image
↓
Embedding
↓
[0.13,0.21,-0.51]

- Qdrant compares that vector against all indexed vectors (using its HNSW graph rather than a brute-force scan for larger collections).

Suppose the similarity scores are:
| Image | Score |
| ----- | ----- |
| Dog 1 | 0.996 |
| Dog 2 | 0.991 |
| Wolf  | 0.974 |
| Cat   | 0.812 |
| Car   | 0.241 |
- Qdrant returns the highest scores first.

