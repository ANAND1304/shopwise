package com.shopwise.repository;

import com.shopwise.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {

    Optional<Product> findBySlug(String slug);

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);

    List<Product> findByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc();

    @Query("{ 'active': true, $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } }, { 'tags': { $regex: ?0, $options: 'i' } } ] }")
    Page<Product> keywordSearch(String query, Pageable pageable);

    List<String> findDistinctCategoriesByActiveTrue();
}
