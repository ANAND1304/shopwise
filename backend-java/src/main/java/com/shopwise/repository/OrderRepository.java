package com.shopwise.repository;

import com.shopwise.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    Page<Order> findByUserId(String userId, Pageable pageable);
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
}
