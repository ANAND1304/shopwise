# MongoDB Atlas Vector Search Setup

ShopWise's semantic search relies on a Vector Search index over the `embedding`
field in the `products` collection.

## 1. Create the index via Atlas UI

1. Go to your cluster → **Atlas Search** tab → **Create Search Index**
2. Choose **JSON Editor**
3. Select database `shopwise`, collection `products`
4. Paste the contents of `vector-index.json` (in this directory)
5. Name the index exactly: `product_vector_index`
6. Click **Create Search Index** — it takes a few minutes to build

## 2. Create the index via Atlas CLI (alternative)

```bash
atlas clusters search indexes create \
  --clusterName <your-cluster> \
  --file vector-index.json \
  --db shopwise \
  --collection products
```

## 3. Index field reference

| Field | Type | Purpose |
|---|---|---|
| `embedding` | vector, 1536 dims, cosine similarity | OpenAI `text-embedding-3-small` output |
| `active` | filter | Excludes soft-deleted products from results |
| `category` | filter | Enables category-scoped semantic search (future use) |

## 4. Query pipeline

The AI search service (`src/routes/ai.js`) runs this `$vectorSearch` aggregation:

```javascript
db.collection('products').aggregate([
  {
    $vectorSearch: {
      index: 'product_vector_index',
      path: 'embedding',
      queryVector: queryEmbedding,   // 1536-dim array from OpenAI
      numCandidates: limit * 10,
      limit: limit,
    }
  },
  { $match: { active: true } },
  {
    $project: {
      title: 1, slug: 1, description: 1, price: 1, category: 1,
      brand: 1, stock: 1, images: 1, tags: 1, featured: 1,
      rating: 1, reviewCount: 1, createdAt: 1,
      score: { $meta: 'vectorSearchScore' }
    }
  },
  { $match: { score: { $gte: 0.6 } } }
]);
```

## 5. Verifying the index is ready

In Atlas UI, the index status should show **Active**. You can test it directly
in the Aggregation tab using the pipeline above with a sample embedding vector.

## 6. Fallback behavior

If `$vectorSearch` fails (index not yet built, no embeddings present, or any
runtime error), the AI service automatically falls back to a regex-based
keyword search across `title`, `description`, `tags`, and `category`. This
ensures search always returns results during initial setup.

## 7. Re-generating embeddings

If you change the embedding model or dimensions, trigger:

```bash
curl -X POST http://localhost:3001/ai/reindex
```

This re-embeds all active products in the background (rate-limited to avoid
OpenAI throttling).
