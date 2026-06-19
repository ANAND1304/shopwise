package com.shopwise.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class ProductRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 5000)
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Brand is required")
    private String brand;

    @Min(value = 0, message = "Stock cannot be negative")
    private int stock;

    private List<String> images;

    private List<String> tags;

    private boolean featured;
}
