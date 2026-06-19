// @xenova/transformers is an ES Module — it must be loaded via dynamic
// import() even from this CommonJS file. We cache the import so it only
// happens once.
let transformersModulePromise = null;
function loadTransformers() {
  if (!transformersModulePromise) {
    transformersModulePromise = import('@xenova/transformers');
  }
  return transformersModulePromise;
}

// Local embedding model — runs entirely on-device, no API key or cost.
// all-MiniLM-L6-v2 produces 384-dimensional embeddings and downloads
// automatically (~25MB) on first use, then caches locally.
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSIONS = 384;

let embedderPromise = null;

function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = loadTransformers().then(({ pipeline }) =>
      pipeline('feature-extraction', MODEL_NAME)
    );
  }
  return embedderPromise;
}

/**
 * Generates an embedding vector for the given text using a local model.
 * Returns a plain number array (384 dimensions).
 */
async function generateEmbedding(text) {
  const cleanText = text.replace(/\n/g, ' ').trim();
  const embedder = await getEmbedder();

  const output = await embedder(cleanText, { pooling: 'mean', normalize: true });

  // output.data is a Float32Array — convert to plain array for MongoDB storage
  return Array.from(output.data);
}

/**
 * Builds the embedding input text from a product's key fields.
 * Combining multiple fields gives better semantic coverage.
 */
function buildProductEmbeddingText({ title, description, category, tags }) {
  const parts = [
    `Product: ${title}`,
    `Category: ${category}`,
    description,
    tags && tags.length > 0 ? `Tags: ${tags.join(', ')}` : '',
  ];
  return parts.filter(Boolean).join('. ');
}

module.exports = { generateEmbedding, buildProductEmbeddingText, EMBEDDING_DIMENSIONS };