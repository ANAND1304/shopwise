package com.shopwise.controller;

import com.shopwise.dto.request.CartItemRequest;
import com.shopwise.security.UserDetailsImpl;
import com.shopwise.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<?> getCart(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(cartService.getCart(user.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(@AuthenticationPrincipal UserDetailsImpl user,
                                     @Valid @RequestBody CartItemRequest req) {
        return ResponseEntity.ok(cartService.addItem(user.getId(), req));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<?> updateItem(@AuthenticationPrincipal UserDetailsImpl user,
                                        @PathVariable String productId,
                                        @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateItem(user.getId(), productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeItem(@AuthenticationPrincipal UserDetailsImpl user,
                                        @PathVariable String productId) {
        return ResponseEntity.ok(cartService.removeItem(user.getId(), productId));
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal UserDetailsImpl user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
