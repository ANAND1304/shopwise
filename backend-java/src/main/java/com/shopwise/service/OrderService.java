package com.shopwise.service;

import com.shopwise.dto.request.OrderRequest;
import com.shopwise.dto.response.Responses.OrderResponse;
import com.shopwise.dto.response.Responses.PagedResponse;
import com.shopwise.exception.BadRequestException;
import com.shopwise.exception.ResourceNotFoundException;
import com.shopwise.model.Order;
import com.shopwise.model.Product;
import com.shopwise.repository.OrderRepository;
import com.shopwise.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    public OrderResponse createOrder(String userId, OrderRequest req) {
        List<Order.OrderItem> items = new ArrayList<>();
        double total = 0;

        for (var itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));

            if (!product.isActive()) {
                throw new BadRequestException("Product is unavailable: " + product.getTitle());
            }
            if (product.getStock() < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for: " + product.getTitle());
            }

            String image = (product.getImages() != null && !product.getImages().isEmpty())
                    ? product.getImages().get(0) : null;

            items.add(Order.OrderItem.builder()
                    .productId(product.getId())
                    .title(product.getTitle())
                    .image(image)
                    .quantity(itemReq.getQuantity())
                    .price(product.getPrice())
                    .build());

            total += product.getPrice() * itemReq.getQuantity();

            // Decrement stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);
        }

        var addr = req.getShippingAddress();
        Order order = Order.builder()
                .userId(userId)
                .items(items)
                .totalAmount(Math.round(total * 100.0) / 100.0)
                .shippingAddress(Order.ShippingAddress.builder()
                        .fullName(addr.getFullName())
                        .addressLine1(addr.getAddressLine1())
                        .addressLine2(addr.getAddressLine2())
                        .city(addr.getCity())
                        .state(addr.getState())
                        .postalCode(addr.getPostalCode())
                        .country(addr.getCountry())
                        .phone(addr.getPhone())
                        .build())
                .status(Order.OrderStatus.CONFIRMED)
                .paymentStatus(Order.PaymentStatus.PAID)
                .build();

        order = orderRepository.save(order);
        cartService.clearCart(userId);

        return OrderResponse.from(order);
    }

    public PagedResponse<OrderResponse> getUserOrders(String userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var pageResult = orderRepository.findByUserId(userId, pageable);
        return PagedResponse.<OrderResponse>builder()
                .content(pageResult.getContent().stream()
                        .map(OrderResponse::from).collect(Collectors.toList()))
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    public OrderResponse getOrderById(String orderId, String userId) {
        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (!order.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Order", orderId);
        }
        return OrderResponse.from(order);
    }

    public PagedResponse<OrderResponse> getAllOrders(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var pageResult = orderRepository.findAll(pageable);
        return PagedResponse.<OrderResponse>builder()
                .content(pageResult.getContent().stream()
                        .map(OrderResponse::from).collect(Collectors.toList()))
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    public OrderResponse updateOrderStatus(String orderId, String status) {
        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        try {
            order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
        return OrderResponse.from(orderRepository.save(order));
    }
}
