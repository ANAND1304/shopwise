package com.shopwise.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items;

    @Valid
    private ShippingAddressRequest shippingAddress;

    @Data
    public static class OrderItemRequest {
        @NotBlank
        private String productId;
        private int quantity;
    }

    @Data
    public static class ShippingAddressRequest {
        @NotBlank private String fullName;
        @NotBlank private String addressLine1;
        private String addressLine2;
        @NotBlank private String city;
        @NotBlank private String state;
        @NotBlank private String postalCode;
        @NotBlank private String country;
        private String phone;
    }
}
