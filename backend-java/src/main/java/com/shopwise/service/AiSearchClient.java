package com.shopwise.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Client for the Node.js AI search microservice.
 * Handles embedding generation and semantic search coordination.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiSearchClient {

    private final RestTemplate restTemplate;

    @Value("${app.ai-service.url}")
    private String aiServiceUrl;

    /**
     * Sends a product to the AI service to generate and store its embedding.
     */
    public void indexProduct(String productId, String title, String description,
                              String category, java.util.List<String> tags) {
        try {
            var payload = Map.of(
                    "productId", productId,
                    "title", title,
                    "description", description,
                    "category", category,
                    "tags", tags != null ? tags : java.util.List.of()
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(
                    Map.of("productId", productId,
                           "title", title,
                           "description", description,
                           "category", category,
                           "tags", tags != null ? tags : java.util.List.of()),
                    headers);

            restTemplate.postForEntity(aiServiceUrl + "/ai/index-product", entity, Map.class);
            log.info("Product {} indexed successfully", productId);
        } catch (Exception e) {
            log.error("Failed to index product {}: {}", productId, e.getMessage());
            // Non-fatal — product is still saved; embedding can be generated later
        }
    }

    /**
     * Triggers re-indexing of all products.
     */
    public void reindexAll() {
        try {
            restTemplate.postForEntity(aiServiceUrl + "/ai/reindex", null, Map.class);
            log.info("Reindex triggered");
        } catch (Exception e) {
            log.error("Reindex failed: {}", e.getMessage());
        }
    }
}
