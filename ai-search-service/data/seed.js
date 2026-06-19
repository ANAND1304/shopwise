/**
 * Seed script: inserts admin user, products, and generates embeddings.
 * Run with: npm run seed
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { generateEmbedding, buildProductEmbeddingText } = require('../src/embeddings');

const MONGODB_URI = process.env.MONGODB_URI;

const products = [
  // ---- Fashion ----
  { title: "Classic Slim-Fit Denim Jacket", description: "A timeless denim jacket with a slim, modern cut. Made from premium washed cotton denim with reinforced stitching, button cuffs, and a comfortable layered fit perfect for transitional weather.", price: 59.99, category: "fashion", brand: "Urban Thread", stock: 45, images: ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600"], tags: ["denim", "jacket", "casual", "outerwear"], featured: true, rating: 4.5, reviewCount: 128 },
  { title: "Floral Wrap Midi Dress", description: "Elegant wrap-style midi dress featuring a vibrant floral print, V-neckline, and adjustable waist tie. Lightweight chiffon fabric flows beautifully for both daytime and evening occasions.", price: 49.99, category: "fashion", brand: "Bloom & Co", stock: 30, images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600"], tags: ["dress", "floral", "summer", "women"], featured: true, rating: 4.7, reviewCount: 95 },
  { title: "Merino Wool Crewneck Sweater", description: "Soft, breathable merino wool sweater with a classic crewneck design. Naturally temperature-regulating, odor-resistant, and perfect for layering during colder months.", price: 79.99, category: "fashion", brand: "Northfield", stock: 60, images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600"], tags: ["sweater", "wool", "winter", "knitwear"], featured: false, rating: 4.6, reviewCount: 71 },
  { title: "High-Waisted Wide-Leg Trousers", description: "Tailored wide-leg trousers with a flattering high-waisted fit. Crafted from a soft stretch-blend fabric that drapes elegantly, ideal for office wear or smart-casual outings.", price: 54.99, category: "fashion", brand: "Modern Atelier", stock: 40, images: ["https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600"], tags: ["trousers", "formal", "office", "women"], featured: false, rating: 4.3, reviewCount: 52 },
  { title: "Oversized Graphic Print Hoodie", description: "Relaxed oversized hoodie with bold graphic print on the front and back. Heavyweight cotton fleece with a soft brushed interior for ultimate comfort on lazy days.", price: 44.99, category: "fashion", brand: "Streetcore", stock: 75, images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600"], tags: ["hoodie", "streetwear", "casual", "unisex"], featured: true, rating: 4.4, reviewCount: 203 },
  { title: "Linen Button-Down Shirt", description: "Breathable 100% linen shirt with a relaxed fit, perfect for warm weather. Features a classic collar, button cuffs, and a slightly textured weave for natural elegance.", price: 39.99, category: "fashion", brand: "Coastal Wear", stock: 55, images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"], tags: ["shirt", "linen", "summer", "men"], featured: false, rating: 4.2, reviewCount: 38 },
  { title: "Pleated Tennis Skirt", description: "Sporty pleated mini skirt with built-in shorts for comfort and coverage. Moisture-wicking fabric makes it ideal for athletic activities or casual everyday wear.", price: 34.99, category: "fashion", brand: "ActiveLine", stock: 65, images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600"], tags: ["skirt", "athletic", "casual", "women"], featured: false, rating: 4.1, reviewCount: 44 },

  // ---- Footwear ----
  { title: "Classic White Leather Sneakers", description: "Minimalist white leather sneakers with a clean silhouette and durable rubber outsole. A versatile everyday shoe that pairs effortlessly with any outfit.", price: 89.99, category: "footwear", brand: "Stride", stock: 80, images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600"], tags: ["sneakers", "leather", "casual", "unisex"], featured: true, rating: 4.8, reviewCount: 312 },
  { title: "Trail Running Shoes with Cushioned Sole", description: "Built for off-road performance, these trail running shoes feature aggressive grip lugs, a responsive cushioned midsole, and a breathable mesh upper for all-day comfort.", price: 109.99, category: "footwear", brand: "PeakRunner", stock: 50, images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"], tags: ["running", "trail", "athletic", "outdoor"], featured: true, rating: 4.6, reviewCount: 187 },
  { title: "Suede Chelsea Boots", description: "Sleek suede Chelsea boots with elastic side panels and a pull tab for easy wear. Featuring a stacked heel and smooth leather lining for sophisticated all-season style.", price: 119.99, category: "footwear", brand: "Heritage Co", stock: 35, images: ["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600"], tags: ["boots", "suede", "formal", "men"], featured: false, rating: 4.5, reviewCount: 66 },
  { title: "Strappy Block Heel Sandals", description: "Elegant block heel sandals with delicate ankle straps and cushioned footbed. A comfortable yet stylish choice for weddings, parties, or summer evenings out.", price: 64.99, category: "footwear", brand: "Lumina", stock: 42, images: ["https://images.unsplash.com/photo-1554062614-6da4fa67725a?w=600"], tags: ["sandals", "heels", "formal", "women"], featured: false, rating: 4.3, reviewCount: 29 },
  { title: "Waterproof Hiking Boots", description: "Rugged waterproof hiking boots with reinforced toe caps, ankle support, and a Vibram outsole for superior traction on rocky and wet terrain.", price: 134.99, category: "footwear", brand: "PeakRunner", stock: 38, images: ["https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600"], tags: ["boots", "hiking", "outdoor", "waterproof"], featured: true, rating: 4.7, reviewCount: 154 },
  { title: "Slip-On Canvas Skate Shoes", description: "Low-profile slip-on canvas shoes with a flat sole and padded collar. A laid-back skate-inspired design that's easy to wear and built to last through daily wear.", price: 39.99, category: "footwear", brand: "Streetcore", stock: 90, images: ["https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600"], tags: ["skate", "canvas", "casual", "unisex"], featured: false, rating: 4.2, reviewCount: 88 },

  // ---- Electronics ----
  { title: "Wireless Noise-Cancelling Headphones", description: "Premium over-ear headphones with adaptive active noise cancellation, 30-hour battery life, and high-fidelity audio drivers for an immersive listening experience.", price: 199.99, category: "electronics", brand: "SoundWave", stock: 60, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"], tags: ["headphones", "audio", "wireless", "noise-cancelling"], featured: true, rating: 4.8, reviewCount: 421 },
  { title: "Smart Fitness Tracker Watch", description: "Lightweight fitness watch with heart rate monitoring, sleep tracking, GPS, and a vibrant AMOLED display. Water-resistant design with a battery that lasts up to 7 days.", price: 149.99, category: "electronics", brand: "PulseTech", stock: 70, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"], tags: ["smartwatch", "fitness", "wearable", "health"], featured: true, rating: 4.5, reviewCount: 298 },
  { title: "Portable Bluetooth Speaker", description: "Compact, rugged Bluetooth speaker with 360-degree sound, deep bass, and IPX7 waterproof rating. Up to 20 hours of playtime on a single charge, perfect for outdoor adventures.", price: 59.99, category: "electronics", brand: "SoundWave", stock: 85, images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"], tags: ["speaker", "bluetooth", "portable", "waterproof"], featured: false, rating: 4.6, reviewCount: 215 },
  { title: "4K Ultra HD Action Camera", description: "Compact action camera capable of recording crisp 4K video at 60fps. Includes image stabilization, waterproof housing, and a wide-angle lens for capturing every adventure.", price: 249.99, category: "electronics", brand: "VisionPro", stock: 28, images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600"], tags: ["camera", "action", "4k", "outdoor"], featured: true, rating: 4.4, reviewCount: 142 },
  { title: "Mechanical Gaming Keyboard with RGB", description: "Tactile mechanical keyboard featuring per-key RGB backlighting, durable switches rated for 50 million keystrokes, and a detachable wrist rest for extended gaming sessions.", price: 89.99, category: "electronics", brand: "GameForge", stock: 55, images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=600"], tags: ["keyboard", "gaming", "mechanical", "rgb"], featured: false, rating: 4.7, reviewCount: 176 },
  { title: "Wireless Charging Pad", description: "Sleek 15W fast wireless charging pad compatible with all Qi-enabled devices. Features an LED indicator, non-slip surface, and overheat protection for safe charging.", price: 24.99, category: "electronics", brand: "PowerLink", stock: 120, images: ["https://images.unsplash.com/photo-1591290619762-d4ee9fc4c4d4?w=600"], tags: ["charger", "wireless", "accessories", "qi"], featured: false, rating: 4.1, reviewCount: 89 },
  { title: "Smart Home Security Camera", description: "1080p HD smart security camera with night vision, two-way audio, and motion detection alerts sent directly to your phone. Easy setup with cloud and local storage options.", price: 49.99, category: "electronics", brand: "GuardEye", stock: 65, images: ["https://images.unsplash.com/photo-1558002038-1055907df827?w=600"], tags: ["camera", "security", "smart-home", "surveillance"], featured: false, rating: 4.3, reviewCount: 167 },
  { title: "27-Inch QHD Monitor", description: "27-inch QHD IPS monitor with 144Hz refresh rate, 1ms response time, and vibrant color accuracy. Ideal for gaming, content creation, and productivity workflows.", price: 329.99, category: "electronics", brand: "VisionPro", stock: 22, images: ["https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=600"], tags: ["monitor", "display", "gaming", "qhd"], featured: true, rating: 4.6, reviewCount: 94 },
  { title: "USB-C Multiport Hub Adapter", description: "Compact 7-in-1 USB-C hub with HDMI 4K output, USB 3.0 ports, SD card reader, and 100W power delivery passthrough — essential for modern laptops.", price: 34.99, category: "electronics", brand: "PowerLink", stock: 95, images: ["https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600"], tags: ["hub", "usb-c", "accessories", "laptop"], featured: false, rating: 4.4, reviewCount: 112 },

  // ---- Home Decor ----
  { title: "Ceramic Table Lamp with Linen Shade", description: "Handcrafted ceramic table lamp featuring an organic textured base and a soft linen drum shade. Casts a warm, ambient glow ideal for living rooms or bedside tables.", price: 69.99, category: "home decor", brand: "Hearth & Form", stock: 30, images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"], tags: ["lamp", "lighting", "ceramic", "decor"], featured: true, rating: 4.5, reviewCount: 58 },
  { title: "Macrame Wall Hanging Tapestry", description: "Boho-style handwoven macrame wall hanging made from natural cotton cord. Adds texture and warmth to any wall, perfect for bedrooms, living rooms, or reading nooks.", price: 39.99, category: "home decor", brand: "Woven Nest", stock: 45, images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"], tags: ["macrame", "wall-decor", "boho", "tapestry"], featured: false, rating: 4.6, reviewCount: 73 },
  { title: "Set of 3 Geometric Throw Pillows", description: "Set of three accent throw pillow covers in coordinating geometric patterns. Made from textured woven cotton with hidden zip closures for easy care.", price: 44.99, category: "home decor", brand: "Hearth & Form", stock: 50, images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"], tags: ["pillows", "cushions", "living-room", "textile"], featured: false, rating: 4.3, reviewCount: 41 },
  { title: "Hand-Poured Soy Wax Candle Set", description: "Set of three hand-poured soy wax candles in warm autumn scents — sandalwood, amber, and vanilla. Clean-burning with cotton wicks and reusable glass jars.", price: 29.99, category: "home decor", brand: "Glow & Co", stock: 100, images: ["https://images.unsplash.com/photo-1602874801007-bd36c0bbc4cf?w=600"], tags: ["candles", "soy-wax", "home-fragrance", "gift"], featured: true, rating: 4.7, reviewCount: 134 },
  { title: "Rattan Pendant Light Fixture", description: "Natural rattan pendant lamp shade that creates beautiful dappled light patterns. Lightweight, easy to install, and brings an earthy, organic feel to any room.", price: 84.99, category: "home decor", brand: "Woven Nest", stock: 25, images: ["https://images.unsplash.com/photo-1565374395542-0e0a3c5f3c75?w=600"], tags: ["lighting", "rattan", "pendant", "boho"], featured: false, rating: 4.4, reviewCount: 36 },
  { title: "Abstract Canvas Wall Art Print", description: "Large-format abstract canvas print featuring warm earthy tones and fluid brushstroke patterns. Gallery-wrapped and ready to hang, adding a modern artistic touch.", price: 54.99, category: "home decor", brand: "Modern Atelier", stock: 40, images: ["https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600"], tags: ["wall-art", "canvas", "abstract", "print"], featured: false, rating: 4.5, reviewCount: 27 },
  { title: "Ceramic Plant Pot Set with Drainage", description: "Set of three minimalist ceramic plant pots in varying sizes, each with a drainage hole and bamboo tray. Perfect for succulents, herbs, or small houseplants.", price: 32.99, category: "home decor", brand: "Hearth & Form", stock: 60, images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600"], tags: ["planters", "ceramic", "plants", "indoor"], featured: false, rating: 4.6, reviewCount: 82 },
  { title: "Wool Area Rug, Diamond Pattern", description: "Soft hand-tufted wool area rug featuring a classic diamond pattern in neutral tones. Durable construction with a non-slip backing, ideal for living rooms and bedrooms.", price: 149.99, category: "home decor", brand: "Woven Nest", stock: 18, images: ["https://images.unsplash.com/photo-1600166898405-da9535204843?w=600"], tags: ["rug", "wool", "flooring", "pattern"], featured: true, rating: 4.7, reviewCount: 65 },

  // ---- Fitness ----
  { title: "Adjustable Dumbbell Set (5-25 lbs)", description: "Space-saving adjustable dumbbell set with quick-change weight dial, ranging from 5 to 25 lbs per dumbbell. Durable molded design ideal for home gyms.", price: 149.99, category: "fitness", brand: "IronCore", stock: 30, images: ["https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600"], tags: ["dumbbells", "weights", "strength", "home-gym"], featured: true, rating: 4.6, reviewCount: 198 },
  { title: "Extra-Thick Yoga Mat with Carry Strap", description: "Extra-thick 8mm yoga mat made from eco-friendly TPE material. Provides superior cushioning and joint support, with a non-slip textured surface and included carry strap.", price: 34.99, category: "fitness", brand: "ZenFlow", stock: 90, images: ["https://images.unsplash.com/photo-1599447292180-45fd84092ef4?w=600"], tags: ["yoga", "mat", "exercise", "eco-friendly"], featured: true, rating: 4.5, reviewCount: 256 },
  { title: "Resistance Bands Set with Handles", description: "Set of five color-coded resistance bands with varying tension levels, comfortable foam handles, door anchor, and ankle straps for a full-body workout anywhere.", price: 24.99, category: "fitness", brand: "FlexBand", stock: 110, images: ["https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600"], tags: ["resistance-bands", "home-workout", "strength", "portable"], featured: false, rating: 4.4, reviewCount: 173 },
  { title: "Foldable Treadmill with Incline", description: "Compact foldable treadmill with adjustable incline settings, 12 preset workout programs, and a quiet motor suitable for apartment use. Includes Bluetooth speaker connectivity.", price: 449.99, category: "fitness", brand: "CardioMax", stock: 12, images: ["https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600"], tags: ["treadmill", "cardio", "home-gym", "running"], featured: true, rating: 4.3, reviewCount: 87 },
  { title: "Adjustable Weight Bench", description: "Heavy-duty adjustable weight bench with multiple incline and decline positions. Folds flat for easy storage and supports up to 600 lbs for safe strength training.", price: 129.99, category: "fitness", brand: "IronCore", stock: 22, images: ["https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600"], tags: ["bench", "strength", "home-gym", "weightlifting"], featured: false, rating: 4.5, reviewCount: 64 },
  { title: "Jump Rope with Ball Bearings", description: "Speed jump rope with smooth ball-bearing rotation and an adjustable steel cable. Lightweight aluminum handles provide a comfortable grip for high-intensity cardio.", price: 14.99, category: "fitness", brand: "FlexBand", stock: 150, images: ["https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=600"], tags: ["jump-rope", "cardio", "hiit", "portable"], featured: false, rating: 4.2, reviewCount: 91 },
  { title: "Foam Roller for Muscle Recovery", description: "High-density foam roller designed for deep tissue massage and muscle recovery. Textured surface targets sore muscles, improving flexibility and reducing soreness.", price: 27.99, category: "fitness", brand: "ZenFlow", stock: 75, images: ["https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600"], tags: ["foam-roller", "recovery", "massage", "stretching"], featured: false, rating: 4.4, reviewCount: 118 },

  // ---- Accessories ----
  { title: "Minimalist Leather Wallet", description: "Slim bifold wallet crafted from full-grain leather with RFID-blocking technology. Features multiple card slots and a slim profile that fits comfortably in any pocket.", price: 39.99, category: "accessories", brand: "Heritage Co", stock: 80, images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"], tags: ["wallet", "leather", "rfid", "men"], featured: false, rating: 4.6, reviewCount: 145 },
  { title: "Polarized Aviator Sunglasses", description: "Classic aviator sunglasses with polarized lenses that reduce glare and provide 100% UV protection. Lightweight metal frame with adjustable nose pads for all-day comfort.", price: 49.99, category: "accessories", brand: "Lumina", stock: 65, images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"], tags: ["sunglasses", "aviator", "polarized", "unisex"], featured: true, rating: 4.5, reviewCount: 187 },
  { title: "Woven Leather Belt", description: "Hand-braided woven leather belt with a brushed metal buckle. Versatile design that pairs well with both casual and formal outfits, available in adjustable lengths.", price: 34.99, category: "accessories", brand: "Heritage Co", stock: 70, images: ["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"], tags: ["belt", "leather", "woven", "men"], featured: false, rating: 4.3, reviewCount: 56 },
  { title: "Canvas Tote Bag with Leather Handles", description: "Durable canvas tote bag featuring reinforced leather handles and an interior zip pocket. Spacious enough for daily essentials, books, or grocery shopping.", price: 29.99, category: "accessories", brand: "Coastal Wear", stock: 95, images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600"], tags: ["tote-bag", "canvas", "everyday", "women"], featured: false, rating: 4.4, reviewCount: 79 },
  { title: "Stainless Steel Watch with Mesh Band", description: "Elegant minimalist watch featuring a stainless steel case, scratch-resistant sapphire crystal, and a comfortable mesh band. Water-resistant up to 50 meters.", price: 89.99, category: "accessories", brand: "Lumina", stock: 40, images: ["https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600"], tags: ["watch", "stainless-steel", "minimalist", "unisex"], featured: true, rating: 4.7, reviewCount: 211 },
  { title: "Wool Blend Beanie Hat", description: "Soft wool-blend beanie with a ribbed knit design and fold-up cuff. Provides warmth without bulk, making it a versatile addition to any winter wardrobe.", price: 19.99, category: "accessories", brand: "Northfield", stock: 120, images: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600"], tags: ["beanie", "wool", "winter", "hat"], featured: false, rating: 4.2, reviewCount: 68 },
  { title: "Leather Crossbody Bag", description: "Compact crossbody bag made from soft pebbled leather, featuring an adjustable strap and multiple interior compartments. A practical yet stylish everyday accessory.", price: 64.99, category: "accessories", brand: "Bloom & Co", stock: 50, images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600"], tags: ["bag", "crossbody", "leather", "women"], featured: false, rating: 4.5, reviewCount: 102 },
];

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Pre-generated BCrypt hash for "Admin@123" (cost factor 10) — compatible with Spring Security's BCryptPasswordEncoder
const ADMIN_PASSWORD_BCRYPT_HASH = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';

async function seed() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set — products will be inserted WITHOUT embeddings.');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('shopwise');

  console.log('Connected. Seeding database...');

  // --- Admin user ---
  const usersCol = db.collection('users');
  const existingAdmin = await usersCol.findOne({ email: 'admin@shopwise.com' });
  if (!existingAdmin) {
    await usersCol.insertOne({
      name: 'Admin User',
      email: 'admin@shopwise.com',
      passwordHash: ADMIN_PASSWORD_BCRYPT_HASH,
      roles: ['USER', 'ADMIN'],
      createdAt: new Date(),
    });
    console.log('Admin user created: admin@shopwise.com / Admin@123');
  } else {
    console.log('Admin user already exists, skipping.');
  }

  // --- Products ---
  const productsCol = db.collection('products');
  const existingCount = await productsCol.countDocuments();

  if (existingCount > 0) {
    console.log(`Products collection already has ${existingCount} documents. Skipping product seed.`);
    console.log('To re-seed, drop the products collection first.');
  } else {
    console.log(`Inserting ${products.length} products...`);

    const slugCounts = {};
    const docs = products.map((p) => {
      let slug = slugify(p.title);
      if (slugCounts[slug] !== undefined) {
        slugCounts[slug]++;
        slug = `${slug}-${slugCounts[slug]}`;
      } else {
        slugCounts[slug] = 0;
      }
      return {
        title: p.title,
        slug,
        description: p.description,
        price: p.price,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        images: p.images,
        tags: p.tags,
        featured: p.featured,
        rating: p.rating,
        reviewCount: p.reviewCount,
        embedding: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const result = await productsCol.insertMany(docs);
    console.log(`Inserted ${result.insertedCount} products.`);

    if (process.env.OPENAI_API_KEY) {
      console.log('Generating embeddings (this may take a few minutes)...');
      let count = 0;
      for (const [idx, insertedId] of Object.entries(result.insertedIds)) {
        const original = docs[idx];
        try {
          const text = buildProductEmbeddingText({
            title: original.title,
            description: original.description,
            category: original.category,
            tags: original.tags,
          });
          const embedding = await generateEmbedding(text);
          await productsCol.updateOne({ _id: insertedId }, { $set: { embedding } });
          count++;
          if (count % 5 === 0) console.log(`  ${count}/${docs.length} embedded...`);
          await new Promise(r => setTimeout(r, 150));
        } catch (err) {
          console.error(`  Failed to embed product ${original.title}: ${err.message}`);
        }
      }
      console.log(`Embedding generation complete: ${count}/${docs.length}`);
    } else {
      console.log('Skipped embedding generation (no OPENAI_API_KEY).');
      console.log('Set OPENAI_API_KEY and call POST /ai/reindex to generate embeddings later.');
    }
  }

  console.log('\nSeed complete!');
  console.log('Remember to create the MongoDB Atlas Vector Search index (see README) named "product_vector_index".');

  await client.close();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
