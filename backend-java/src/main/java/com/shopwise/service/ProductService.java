package com.shopwise.service;

import com.shopwise.dto.request.ProductRequest;
import com.shopwise.dto.response.Responses.PagedResponse;
import com.shopwise.dto.response.Responses.ProductResponse;
import com.shopwise.exception.ConflictException;
import com.shopwise.exception.ResourceNotFoundException;
import com.shopwise.model.Product;
import com.shopwise.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final AiSearchClient aiSearchClient;

    public PagedResponse<ProductResponse> getProducts(int page, int size, String category, String sort) {
        var sortOrder = buildSort(sort);
        var pageable = PageRequest.of(page, size, sortOrder);

        var pageResult = (category != null && !category.isBlank())
                ? productRepository.findByCategoryAndActiveTrue(category, pageable)
                : productRepository.findByActiveTrue(pageable);

        var content = pageResult.getContent().stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());

        return PagedResponse.<ProductResponse>builder()
                .content(content)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    public ProductResponse getProductById(String id) {
        return ProductResponse.from(findOrThrow(id));
    }

    public ProductResponse getProductBySlug(String slug) {
        var product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + slug));
        return ProductResponse.from(product);
    }

    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc()
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public ProductResponse createProduct(ProductRequest req) {
        String slug = toSlug(req.getTitle());
        if (productRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Product product = Product.builder()
                .title(req.getTitle())
                .slug(slug)
                .description(req.getDescription())
                .price(req.getPrice())
                .category(req.getCategory())
                .brand(req.getBrand())
                .stock(req.getStock())
                .images(req.getImages())
                .tags(req.getTags())
                .featured(req.isFeatured())
                .build();

        product = productRepository.save(product);

        // Async indexing — fire and forget
        final String productId = product.getId();
        final Product saved = product;
        new Thread(() -> aiSearchClient.indexProduct(
                productId, saved.getTitle(), saved.getDescription(),
                saved.getCategory(), saved.getTags())).start();

        return ProductResponse.from(product);
    }

    public ProductResponse updateProduct(String id, ProductRequest req) {
        Product product = findOrThrow(id);

        product.setTitle(req.getTitle());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setCategory(req.getCategory());
        product.setBrand(req.getBrand());
        product.setStock(req.getStock());
        product.setImages(req.getImages());
        product.setTags(req.getTags());
        product.setFeatured(req.isFeatured());

        product = productRepository.save(product);

        // Re-index updated product
        final Product updated = product;
        new Thread(() -> aiSearchClient.indexProduct(
                updated.getId(), updated.getTitle(), updated.getDescription(),
                updated.getCategory(), updated.getTags())).start();

        return ProductResponse.from(product);
    }

    public void deleteProduct(String id) {
        Product product = findOrThrow(id);
        product.setActive(false);
        productRepository.save(product); // soft delete
    }

    public PagedResponse<ProductResponse> keywordSearch(String query, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var pageResult = productRepository.keywordSearch(query, pageable);
        var content = pageResult.getContent().stream()
                .map(ProductResponse::from).collect(Collectors.toList());
        return PagedResponse.<ProductResponse>builder()
                .content(content)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    public List<String> getCategories() {
        return productRepository.findAll().stream()
                .filter(Product::isActive)
                .map(Product::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // ---- helpers ----

    private Product findOrThrow(String id) {
        return productRepository.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private Sort buildSort(String sort) {
        return switch (Optional.ofNullable(sort).orElse("newest")) {
            case "price_asc"  -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating"     -> Sort.by(Sort.Direction.DESC, "rating");
            default           -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private static final Pattern NON_LATIN    = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE   = Pattern.compile("[\\s]");
    private static final Pattern MULTI_HYPHEN = Pattern.compile("-+");

    private String toSlug(String title) {
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        return NON_LATIN.matcher(
                MULTI_HYPHEN.matcher(
                        WHITESPACE.matcher(normalized.toLowerCase(Locale.ENGLISH))
                                  .replaceAll("-")
                ).replaceAll("-")
        ).replaceAll("").trim();
    }
}
