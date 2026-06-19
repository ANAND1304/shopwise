package com.shopwise.dto.response;

import com.shopwise.model.Cart;
import com.shopwise.model.Order;
import com.shopwise.model.Product;
import com.shopwise.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public class Responses {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String type;
        private String id;
        private String name;
        private String email;
        private Set<User.Role> roles;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProductResponse {
        private String id;
        private String title;
        private String slug;
        private String description;
        private double price;
        private String category;
        private String brand;
        private int stock;
        private List<String> images;
        private List<String> tags;
        private boolean featured;
        private double rating;
        private int reviewCount;
        private Instant createdAt;

        public static ProductResponse from(Product p) {
            return ProductResponse.builder()
                    .id(p.getId())
                    .title(p.getTitle())
                    .slug(p.getSlug())
                    .description(p.getDescription())
                    .price(p.getPrice())
                    .category(p.getCategory())
                    .brand(p.getBrand())
                    .stock(p.getStock())
                    .images(p.getImages())
                    .tags(p.getTags())
                    .featured(p.isFeatured())
                    .rating(p.getRating())
                    .reviewCount(p.getReviewCount())
                    .createdAt(p.getCreatedAt())
                    .build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PagedResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderResponse {
        private String id;
        private String userId;
        private List<Order.OrderItem> items;
        private double totalAmount;
        private Order.ShippingAddress shippingAddress;
        private Order.OrderStatus status;
        private Order.PaymentStatus paymentStatus;
        private Instant createdAt;

        public static OrderResponse from(Order o) {
            return OrderResponse.builder()
                    .id(o.getId())
                    .userId(o.getUserId())
                    .items(o.getItems())
                    .totalAmount(o.getTotalAmount())
                    .shippingAddress(o.getShippingAddress())
                    .status(o.getStatus())
                    .paymentStatus(o.getPaymentStatus())
                    .createdAt(o.getCreatedAt())
                    .build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CartResponse {
        private String id;
        private String userId;
        private List<Cart.CartItem> items;
        private double totalAmount;

        public static CartResponse from(Cart c) {
            double total = c.getItems().stream()
                    .mapToDouble(i -> i.getPrice() * i.getQuantity())
                    .sum();
            return CartResponse.builder()
                    .id(c.getId())
                    .userId(c.getUserId())
                    .items(c.getItems())
                    .totalAmount(Math.round(total * 100.0) / 100.0)
                    .build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;

        public static ApiResponse ok(String message) {
            return new ApiResponse(true, message, null);
        }

        public static ApiResponse ok(String message, Object data) {
            return new ApiResponse(true, message, data);
        }

        public static ApiResponse error(String message) {
            return new ApiResponse(false, message, null);
        }
    }
}
