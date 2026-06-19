package com.shopwise.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String title;

    @Indexed(unique = true)
    private String slug;

    private String description;

    private double price;

    private String category;

    private String brand;

    private int stock;

    private List<String> images;

    private List<String> tags;

    @Builder.Default
    private boolean featured = false;

    @Builder.Default
    private double rating = 0.0;

    private int reviewCount;

    // Populated by AI service — stored as List<Double> (1536-dim vector)
    private List<Double> embedding;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
