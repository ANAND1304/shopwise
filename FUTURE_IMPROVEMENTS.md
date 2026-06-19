# Future Improvements

## Search & AI
- Hybrid scoring: combine `$vectorSearch` score with text relevance (BM25 via Atlas Search `$search`) using `$rankFusion` (Atlas Search 2024+)
- Personalized search re-ranking based on user purchase/browse history
- Multi-modal search: image-based product search using CLIP embeddings
- Query expansion / spell correction before embedding
- Cache frequent query embeddings (Redis) to cut OpenAI costs
- Switch to async message queue (SQS/RabbitMQ) for product indexing instead of fire-and-forget threads

## Auth & Security
- Refresh tokens + token rotation (currently single long-lived access token)
- Email verification on registration
- Password reset flow
- Rate limiting on auth endpoints (brute-force protection)
- OAuth2 social login (Google, GitHub)

## Orders & Payments
- Real payment gateway integration (Stripe/Razorpay) — currently auto-marks PAID
- Order cancellation & refund workflow
- Inventory reservation during checkout to prevent overselling under concurrency
- Email notifications for order status changes

## Products
- Reviews & ratings system (collection exists in design, not yet wired to API)
- Product variants (size, color) with separate stock tracking
- Bulk CSV import for admin product management
- Image upload to S3/Cloudinary instead of URL-only

## Frontend
- Server-side rendering / SSG for SEO on product pages
- Wishlist / saved items
- Order tracking timeline UI
- Skeleton loading for search page during AI latency
- i18n / multi-currency support

## Infrastructure
- Kubernetes manifests for production deployment
- Centralized logging (ELK) and tracing (OpenTelemetry) across Java + Node services
- Health checks and readiness probes for all three services
- CI/CD pipeline (GitHub Actions): test → build → push images → deploy
- Horizontal scaling: Java backend and AI service are stateless and can scale independently

## Testing
- Unit tests for service layer (JUnit + Mockito)
- Integration tests with Testcontainers (MongoDB)
- E2E tests (Playwright) for critical flows: register → browse → cart → checkout
- Load testing for vector search endpoint under concurrent queries
