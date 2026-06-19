package com.shopwise.controller;

import com.shopwise.dto.response.Responses.ApiResponse;
import com.shopwise.service.AiSearchClient;
import com.shopwise.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final OrderService orderService;
    private final AiSearchClient aiSearchClient;

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId,
                                               @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    @PostMapping("/reindex")
    public ResponseEntity<?> reindex() {
        aiSearchClient.reindexAll();
        return ResponseEntity.ok(ApiResponse.ok("Reindexing triggered"));
    }
}
