# ShopWise — AI-Powered E-Commerce Platform

A full-stack e-commerce application with semantic AI product search powered by OpenAI embeddings and MongoDB Atlas Vector Search.

## Architecture

```
shopwise/
├── frontend/           React + Vite + Tailwind CSS
├── backend-java/       Spring Boot (main business backend)
└── ai-search-service/  Node.js + Express (AI embeddings & vector search)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Zustand |
| Backend | Java 17, Spring Boot 3, Spring Security, Spring Data MongoDB |
| AI Service | Node.js 18, Express, MongoDB Node Driver |
| Database | MongoDB Atlas |
| Auth | JWT (access tokens) |
| AI | OpenAI text-embedding-3-small |
| Search | MongoDB Atlas Vector Search |

## Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- MongoDB Atlas account (free tier works)
- OpenAI API key

## Quick Start

### 1. MongoDB Atlas Setup

1. Create a free cluster at https://cloud.mongodb.com
2. Create a database user with read/write access
3. Whitelist your IP (or use 0.0.0.0/0 for dev)
4. Copy your connection string

### 2. Create Vector Search Index

In Atlas UI → Search → Create Search Index → JSON editor:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

Index name: `product_vector_index`  
Collection: `products`

### 3. Environment Variables

Copy `.env.example` files in each service directory and fill in values.

### 4. Run with Docker Compose

```bash
docker-compose up --build
```

### 5. Manual Run

**Backend (Java):**
```bash
cd backend-java
./mvnw spring-boot:run
```

**AI Search Service:**
```bash
cd ai-search-service
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 6. Seed Sample Data

```bash
cd ai-search-service
npm run seed
```

This creates 40+ products and indexes their embeddings.

## Default Ports

| Service | Port |
|---|---|
| Frontend | 5173 |
| Java Backend | 8080 |
| AI Search Service | 3001 |

## Default Admin Account

After seeding: `admin@shopwise.com` / `Admin@123`

## API Documentation

See `backend-java/API.md` and `ai-search-service/API.md`.


## WebSite View 







