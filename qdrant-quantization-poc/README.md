# Create the Normal (Float32) Collection

## What happened internally?
When you execute:
* await client.createCollection(...)

Qdrant creates:
normal_search

* Inside it, it allocates space for:
Vectors
↓
384 float values
↓
Float32
↓
Cosine similarity
↓
HNSW index

### At this point:
- No vectors yet
- No graph yet
- No quantization
Just an empty collection

* The HNSW graph will be built incrementally as we insert vectors.

#### Why use 384 dimensions?
For the POC, 384 dimensions are ideal because they are:
- Small enough to keep the demo fast.
- Large enough to resemble real embedding models.
- Used by common embedding models such as all-MiniLM-L6-v2.
Later, you can repeat the same experiment with 768, 1024, or 1536 dimensions.


# Why save embeddings.json?
This is one of the most important decisions in the benchmark.
- If you generate embeddings separately for each collection:
Normal Collection
↓
Generate embeddings
↓
Insert
- then later:
Scalar Collection
↓
Generate embeddings again
↓
Insert
* you risk tiny differences (different model version, normalization, floating-point behavior, etc.).

# generate once and reuse everywhere:
Generate Embeddings (ONE TIME)
            │
            ▼
      embeddings.json
            │
     ┌──────┼─────────┐
     ▼      ▼         ▼
 Normal  Scalar      PQ
     ▼      ▼         ▼
           Binary

## Why not insert immediately?
Because we'll use the same embeddings.json for:
normal_search
scalar_search
pq_search
binary_search

## Create Scalar definitions:
What does this configuration mean?
scalar: {
    type: "int8",
    quantile: 0.99,
    always_ram: true
}

## type: "int8"
Normal collection stores:
Float32
4 bytes

Scalar stores:
Int8
1 byte
- Approximately 4× less memory.


## quantile: 0.99
Suppose your vector values are:
-0.98
-0.87
...
0.91
5.4

That 5.4 is an outlier.

If Qdrant uses the full range:
-0.98 → 5.4
- most values lose precision.

Instead, with
   quantile: 0.99
Qdrant ignores the most extreme 1% of values when calculating the scaling range. This usually preserves more precision for the majority of vector values.

## always_ram: true
This tells Qdrant to keep the quantized vectors in RAM.
Benefits:
Faster search.
Lower latency.
Less disk access.
- If set to false, quantized vectors may be loaded from disk as needed, which can reduce memory usage but may increase latency.

# What is compression: "x16"?

Imagine your vector:
384 Float32 values

Normal storage:
384 × 4 bytes = 1536 bytes

With PQ:
384 values
        │
        ▼
Split into small groups
        │
        ▼
Each group replaced by a codebook index
        │
        ▼
Compressed representation
- x16 means approximately 16× smaller than the original vector representation.

Typical options are:
| Compression | Memory Saving | Accuracy  |
| ----------- | ------------- | --------- |
| x4          | Low           | Very High |
| x8          | Medium        | High      |
| x16         | High          | Good      |
| x32         | Very High     | Lower     |
- For learning, x16 is a good balance.

# What is a Benchmark?
A benchmark is a standardized test used to measure and compare the performance of different implementations under the same conditions.
Think of it like a 100-meter race.

Four runners:
Normal
Scalar
PQ
Binary

Same:
Track
Distance
Weather
Start time
- The only thing changing is the runner.

The winner is determined by measuring:
Time
Speed
Energy used
- Your benchmark did exactly that.

The only thing changing was:
Normal Float32
↓
Scalar Quantization
↓
Product Quantization
↓
Binary Quantization

Everything else stayed the same:
same query
same embedding model
same vectors
same HNSW
same top 5
- That is a benchmark.

# Why benchmark?
Suppose Qdrant claims
Scalar is faster

How do you know?
You measure it.

Suppose Pinecone claims
Binary uses less RAM

How do you know?
Benchmark.

- Benchmarks replace opinions with measurements.

Your Benchmark
Your benchmark measured
Search Time
and

Search Results
Normal
11.14 ms
Scalar
5.83 ms
PQ
5.42 ms
Binary
6.71 ms

# Why use 5,000 or 10,000 vectors?
Because then you'll start seeing differences like:

Float32
Search Time
20 ms
RAM
500 MB

Scalar
Search Time
15 ms
RAM
150 MB

PQ
Search Time
10 ms
RAM
60 MB

Binary
Search Time
7 ms
RAM
25 MB

- These numbers are illustrative, but they show the kind of trade-offs quantization is designed to achieve.

## For example:

console.time("Search");
await client.query(...);
console.timeEnd("Search");
- This is also benchmarking.

Or:

const start = process.hrtime.bigint();
await client.query(...);
const end = process.hrtime.bigint();
console.log(Number(end - start) / 1_000_000);

- This is another way to benchmark.

In large companies
When someone says:
"Benchmark the search engine."
They are not asking you to use performance.now() specifically.
They mean:
"Measure and compare its performance."

# Let's go through each one and how you can measure it in your Qdrant POC.

1. Search Latency (How long one search takes)
Meaning:
How long Qdrant takes to answer one search request.

const start = performance.now();
await client.query("normal_search", {
    query: queryVector,
    limit: 5,
});
const end = performance.now();
console.log(`Search Time: ${end - start} ms`);

You've already implemented this.

2. Insert Speed (How long insertion takes)
Meaning:
How long it takes to insert vectors into Qdrant.

const start = performance.now();
await client.upsert("normal_search", {
    wait: true,
    points,
});
const end = performance.now();
console.log(`Insert Time: ${end - start} ms`);

or

console.time("Insert");
await client.upsert(...);
console.timeEnd("Insert");

- You already measured this too.

3. Memory Usage
There are two perspectives.

A. Node.js Process Memory
console.log(process.memoryUsage());
Example:

{
  rss: 69423104,
  heapTotal: 28745728,
  heapUsed: 18435216,
  external: 2510208
}
- Useful for measuring your application's memory.

B. Qdrant Container Memory (More Important)

Since Qdrant runs in Docker:
docker stats

Example:
CONTAINER              CPU %     MEM USAGE
qdrant-quantization    2.1%      45MB

- This tells you how much RAM Qdrant itself is using.

4. CPU Usage
Again, use Docker.
docker stats

Example:
CPU %
1.2%
5.8%
10%

- If you send many queries simultaneously, you'll see CPU usage increase.

5. Throughput (Queries Per Second - QPS)
This is one of the most important metrics.

Formula:
QPS = Total Queries / Total Time

Example:
const start = performance.now();
for (let i = 0; i < 1000; i++) {
    await client.query("normal_search", {
        query: queryVector,
        limit: 5,
    });
}
const end = performance.now();
const seconds = (end - start) / 1000;
console.log("QPS:", 1000 / seconds);

Example output:
1000 queries
2 seconds
QPS = 500

- Meaning Qdrant handled 500 searches per second.

6. Recall
This is unique to vector search.
- Recall measures how close an approximate search is to the exact search.

Suppose:
Normal Search:
Apple
Samsung
Pixel
OnePlus
MacBook

PQ Search:
Apple
Samsung
Pixel
Dell
HP

Common results:
Apple
Samsung
Pixel

Recall:
3 / 5
=
60%

Code:
const normal = normalResults.map(x => x.id);
const pq = pqResults.map(x => x.id);
const common = normal.filter(id => pq.includes(id));
const recall = common.length / normal.length;
console.log(recall);

7. Index Build Time
This measures how long Qdrant takes to build the HNSW index while inserting vectors.

Example:
const start = performance.now();
await client.upsert(collection, {
    wait: true,
    points,
});
const end = performance.now();
console.log("Index Build Time:", end - start);

With wait: true, the operation waits until indexing is complete, so the measured time includes indexing work.

* For large datasets (e.g., 1 million vectors), this metric becomes significant.

## What big companies measure
| Metric            | How to Measure                                     |
| ----------------- | -------------------------------------------------- |
| Search Latency    | `performance.now()` around `client.query()`        |
| Insert Speed      | `performance.now()` around `client.upsert()`       |
| Memory Usage      | `docker stats`, `htop`, or container monitoring    |
| CPU Usage         | `docker stats`, `top`, `htop`                      |
| QPS (Queries/sec) | Total queries ÷ total elapsed time                 |
| Recall            | Compare ANN results against the Float32 baseline   |
| Index Build Time  | Time from insertion start until indexing completes |

## What companies use besides code
In production, engineers don't usually write custom timing loops for everything. They use dedicated benchmarking and monitoring tools.

| Tool                      | Purpose                                |
| ------------------------- | -------------------------------------- |
| `performance.now()`       | Measure execution time in JavaScript   |
| `console.time()`          | Quick timing during development        |
| `process.hrtime.bigint()` | High-precision timing in Node.js       |
| `docker stats`            | CPU and memory usage of containers     |
| `htop` / `top`            | CPU and RAM usage on Linux             |
| `k6`                      | Load testing APIs                      |
| `wrk`                     | High-performance HTTP benchmarking     |
| `autocannon`              | HTTP benchmarking for Node.js services |
| `Apache Bench (ab)`       | Basic HTTP load testing                |
| `Prometheus` + `Grafana`  | Continuous production monitoring       |

