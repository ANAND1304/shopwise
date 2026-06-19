package com.shopwise.service;

import com.shopwise.dto.request.CartItemRequest;
import com.shopwise.dto.response.Responses.CartResponse;
import com.shopwise.exception.BadRequestException;
import com.shopwise.exception.ResourceNotFoundException;
import com.shopwise.model.Cart;
import com.shopwise.repository.CartRepository;
import com.shopwise.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartResponse getCart(String userId) {
        var cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> Cart.builder().userId(userId).build());
        return CartResponse.from(cart);
    }

    public CartResponse addItem(String userId, CartItemRequest req) {
        var product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", req.getProductId()));

        if (product.getStock() < req.getQuantity()) {
            throw new BadRequestException("Insufficient stock for: " + product.getTitle());
        }

        var cart = cartRepository.findByUserId(userId)
                .orElse(Cart.builder().userId(userId).items(new ArrayList<>()).build());

        // Update quantity if item already in cart
        var existing = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(req.getProductId()))
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + req.getQuantity());
        } else {
            String image = (product.getImages() != null && !product.getImages().isEmpty())
                    ? product.getImages().get(0) : null;

            cart.getItems().add(Cart.CartItem.builder()
                    .productId(product.getId())
                    .title(product.getTitle())
                    .image(image)
                    .price(product.getPrice())
                    .quantity(req.getQuantity())
                    .build());
        }

        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
        return CartResponse.from(cart);
    }

    public CartResponse updateItem(String userId, String productId, int quantity) {
        var cart = findCartOrThrow(userId);

        if (quantity <= 0) {
            cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        } else {
            cart.getItems().stream()
                    .filter(i -> i.getProductId().equals(productId))
                    .findFirst()
                    .ifPresent(i -> i.setQuantity(quantity));
        }

        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
        return CartResponse.from(cart);
    }

    public CartResponse removeItem(String userId, String productId) {
        var cart = findCartOrThrow(userId);
        cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
        return CartResponse.from(cart);
    }

    public void clearCart(String userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cart.setUpdatedAt(Instant.now());
            cartRepository.save(cart);
        });
    }

    private Cart findCartOrThrow(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
    }
}
