package com.shopwise.controller;

import com.shopwise.dto.request.OrderRequest;
import com.shopwise.security.UserDetailsImpl;
import com.shopwise.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@AuthenticationPrincipal UserDetailsImpl user,
                                         @Valid @RequestBody OrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(user.getId(), req));
    }

    @GetMapping
    public ResponseEntity<?> getUserOrders(@AuthenticationPrincipal UserDetailsImpl user,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getUserOrders(user.getId(), page, size));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@AuthenticationPrincipal UserDetailsImpl user,
                                      @PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId, user.getId()));
    }
}
