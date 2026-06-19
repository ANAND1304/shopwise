const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { generateEmbedding, buildProductEmbeddingText } = require('../embeddings');

const router = express.Router();

/**
 * POST /ai/index-product
 * Generates and stores an embedding for a single product.
 * Called by Java backend when a product is created/updated.
 */
router.post('/index-product', async (req, res, next) => {
  try {
    const { productId, title, description, category, tags } = req.body;

    if (!productId || !title || !description) {
      return res.status(400).json({ error: 'productId, title, and description are required' });
    }

    const text = buildProductEmbeddingText({ title, description, category, tags });
    const embedding = await generateEmbedding(text);

    const db = getDB();
    await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: { embedding } }
    );

    res.json({ success: true, productId, embeddingLength: embedding.length });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /ai/index-products-bulk
 * Indexes a batch of products. Useful for initial setup.
 */
router.post('/index-products-bulk', async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'products array is required' });
    }

    const db = getDB();
    const results = [];

    for (const p of products) {
      try {
        const text = buildProductEmbeddingText(p);
        const embedding = await generateEmbedding(text);
        await db.collection('products').updateOne(
          { _id: new ObjectId(p.productId) },
          { $set: { embedding } }
        );
        results.push({ productId: p.productId, status: 'indexed' });
      } catch (err) {
        results.push({ productId: p.productId, status: 'error', error: err.message });
      }
    }

    res.json({ success: true, indexed: results.filter(r => r.status === 'indexed').length, results });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /ai/search
 * Semantic search using MongoDB Atlas Vector Search.
 * Falls back to regex keyword search if vector search fails.
 */
router.post('/search', async (req, res, next) => {
  try {
    const { query, limit = 12, minScore = 0.6 } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'query is required' });
    }

    const db = getDB();
    let results = [];
    let searchType = 'vector';

    try {
      // Generate query embedding
      const queryEmbedding = await generateEmbedding(query);

      // MongoDB Atlas Vector Search pipeline
      const pipeline = [
        {
          $vectorSearch: {
            index: 'product_vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: limit * 10,  // fetch wider candidates for better recall
            limit: limit,
          },
        },
        {
          $match: { active: true },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            slug: 1,
            description: 1,
            price: 1,
            category: 1,
            brand: 1,
            stock: 1,
            images: 1,
            tags: 1,
            featured: 1,
            rating: 1,
            reviewCount: 1,
            createdAt: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
        {
          $match: { score: { $gte: minScore } },
        },
      ];

      results = await db.collection('products').aggregate(pipeline).toArray();
    } catch (vectorErr) {
      console.warn('Vector search failed, falling back to keyword search:', vectorErr.message);
      searchType = 'keyword';
      results = await keywordSearchFallback(db, query, limit);
    }

    // Normalize _id to id for frontend
    const normalized = results.map(({ _id, score, ...rest }) => ({
      ...rest,
      id: _id.toString(),
      score: score || null,
    }));

    res.json({ success: true, searchType, count: normalized.length, results: normalized });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /ai/reindex
 * Re-generates embeddings for ALL products.
 * Admin-triggered endpoint. Runs async and returns immediately.
 */
router.post('/reindex', async (req, res, next) => {
  try {
    const db = getDB();
    const total = await db.collection('products').countDocuments({ active: true });

    // Start async reindexing job
    reindexAllProducts(db).catch(err => console.error('Reindex error:', err));

    res.json({ success: true, message: `Reindexing ${total} products in background` });
  } catch (err) {
    next(err);
  }
});

// ---- helpers ----

async function reindexAllProducts(db) {
  const products = await db.collection('products')
    .find({ active: true })
    .project({ _id: 1, title: 1, description: 1, category: 1, tags: 1 })
    .toArray();

  console.log(`Starting reindex of ${products.length} products...`);
  let indexed = 0;

  for (const p of products) {
    try {
      const text = buildProductEmbeddingText({
        title: p.title,
        description: p.description,
        category: p.category,
        tags: p.tags,
      });
      const embedding = await generateEmbedding(text);
      await db.collection('products').updateOne(
        { _id: p._id },
        { $set: { embedding } }
      );
      indexed++;
      // Rate limit: ~1 request per 200ms to stay within OpenAI limits
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`Failed to index product ${p._id}:`, err.message);
    }
  }

  console.log(`Reindex complete: ${indexed}/${products.length} products indexed`);
}

async function keywordSearchFallback(db, query, limit) {
  const regex = new RegExp(query.split(' ').join('|'), 'i');
  return db.collection('products')
    .find({
      active: true,
      $or: [
        { title: regex },
        { description: regex },
        { tags: regex },
        { category: regex },
      ],
    })
    .limit(limit)
    .toArray();
}

module.exports = router;
