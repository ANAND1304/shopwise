package com.shopwise.controller;

import com.shopwise.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }
}
