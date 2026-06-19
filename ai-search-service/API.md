# AI Search Service API

Base URL: `http://localhost:3001`

## GET /health
Health check.

**Response 200**
```json
{ "status": "ok", "service": "shopwise-ai-search", "timestamp": "2026-06-13T..." }
```

---

## POST /ai/index-product
Generates an embedding for a single product and stores it in MongoDB.
Called internally by the Java backend after product create/update.

**Request body**
```json
{
  "productId": "665f1c2e8f1b2c0012345678",
  "title": "Classic White Leather Sneakers",
  "description": "Minimalist white leather sneakers...",
  "category": "footwear",
  "tags": ["sneakers", "leather", "casual"]
}
```

**Response 200**
```json
{ "success": true, "productId": "665f...", "embeddingLength": 1536 }
```

---

## POST /ai/index-products-bulk
Indexes multiple products in one request.

**Request body**
```json
{
  "products": [
    { "productId": "...", "title": "...", "description": "...", "category": "...", "tags": [] }
  ]
}
```

**Response 200**
```json
{ "success": true, "indexed": 10, "results": [ { "productId": "...", "status": "indexed" } ] }
```

---

## POST /ai/search
Semantic product search using MongoDB Atlas Vector Search. Falls back to regex
keyword search if vector search is unavailable or returns nothing above threshold.

**Request body**
```json
{ "query": "comfortable shoes for hiking in the mountains", "limit": 12, "minScore": 0.6 }
```

**Response 200**
```json
{
  "success": true,
  "searchType": "vector",
  "count": 3,
  "results": [
    {
      "id": "665f...",
      "title": "Waterproof Hiking Boots",
      "slug": "waterproof-hiking-boots",
      "description": "...",
      "price": 134.99,
      "category": "footwear",
      "brand": "PeakRunner",
      "stock": 38,
      "images": ["..."],
      "tags": ["boots", "hiking", "outdoor", "waterproof"],
      "featured": true,
      "rating": 4.7,
      "reviewCount": 154,
      "score": 0.87
    }
  ]
}
```

`searchType` is `"vector"` when Atlas Vector Search succeeded, or `"keyword"` if it
fell back to regex search (score will be `null` in that case).

---

## POST /ai/reindex
Triggers a background re-embedding of all active products. Returns immediately;
the job runs asynchronously with rate-limiting (~5 req/sec to OpenAI).

**Response 200**
```json
{ "success": true, "message": "Reindexing 47 products in background" }
```
