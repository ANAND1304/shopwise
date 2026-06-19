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

<img width="1920" height="1200" alt="Screenshot 2026-06-19 150105" src="https://github.com/user-attachments/assets/dd317d87-e5a4-406f-a122-990ede0939da" />
<img width="1501" height="822" alt="Screenshot 2026-06-19 160219 - Copy - Copy" src="https://github.com/user-attachments/assets/f2a2bff0-3141-431b-884b-7c57b40274bf" />
<img width="1475" height="818" alt="Screenshot 2026-06-19 160237" src="https://github.com/user-attachments/assets/51850e9d-b631-491f-95cf-61f46be0b7f2" />
<img width="1505" height="822" alt="Screenshot 2026-06-19 160315 - Copy - Copy" src="https://github.com/user-attachments/assets/b726bbea-2cbd-4339-93de-97501872e6bb" />
<img widt<img width="1497" height="825" alt="Screenshot 2026-06-19 160924" src="https://github.com/user-attachments/assets/653e57a4-a791-47bf-96d9-9f00ab2be567" />
h="1507" height="818" alt="Screenshot 2026-06-19 160339 - Copy" src="https://github.com/user-attachments/assets/1af9c24e-2395-42be-9860-a532eaa12971" />
<img width="1502" height="822" alt="Screenshot 2026-06-19 160442" src="https://github.com/user-attachments/assets/5531be3b-8b36-4085-b92a-d0ea5804ea78" />
<img width="1503" height="827" alt="Screenshot 2026-06-19 160527 - Copy" src="https://github.com/user-attachments/assets/9f757e40-fc07-4df1-a6c3-3e1700a4e18a" />
<img width="1492" height="828" alt="Screenshot 2026-06-19 160507" src="https://github.com/user-attachments/assets/99318ec2-02a4-4309-9183-a89c9a60cf7d" />
<img width="1492" height="828" alt="Screenshot 2026-06-19 160507 - Copy" src="https://github.com/user-attachments/assets/8ac0e241-3377-4e52-b01f-8da82824b0b1" />
<img width="1501" height="817" alt="Screenshot 2026-06-19 160546" src="https://github.com/user-attachments/assets/ce3d02e7-c037-44b7-bbc9-64a81401f49a" />
<img width="1510" height="825" alt="Screenshot 2026-06-19 160754" src="https://github.com/user-attachments/assets/4cd7429f-b584-47f9-92d2-c18c00015cb1" />
<img width="1521" height="827" alt="Screenshot 2026-06-19 160708" src="https://github.com/user-attachments/assets/2cde1bb3-a00e-464d-a4c2-dc74d06ed678" />
<img width="1497" height="827" alt="Screenshot 2026-06-19 160623" src="https://github.com/user-attachments/assets/326bc18d-e652-4854-a141-1d26d681b498" />

<img width="1521" height="821" alt="Screenshot 2026-06-19 160830" src="https://github.com/user-attachments/assets/afb22253-593d-4393-aa5a-82c9cb673a0e" />
<img width="1506" height="826" alt="Screenshot 2026-06-19 160813" src="https://github.com/user-attachments/assets/8d5e5b49-b9b6-4a6e-8f54-398757385918" />




