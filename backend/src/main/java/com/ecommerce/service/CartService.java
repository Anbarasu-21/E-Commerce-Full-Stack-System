package com.ecommerce.service;

import com.ecommerce.dto.request.CartRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<CartResponse> getCart(User user) {
        return cartRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CartResponse addToCart(User user, CartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        if (product.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock (" + product.getQuantity() + ")");
        }

        Optional<Cart> existingCartItem = cartRepository.findByUserAndProduct(user, product);
        Cart cartItem;

        if (existingCartItem.isPresent()) {
            cartItem = existingCartItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            if (product.getQuantity() < newQuantity) {
                throw new IllegalArgumentException("Total requested quantity exceeds available stock (" + product.getQuantity() + ")");
            }
            cartItem.setQuantity(newQuantity);
        } else {
            cartItem = Cart.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
        }

        Cart saved = cartRepository.save(cartItem);
        return mapToResponse(saved);
    }

    @Transactional
    public void removeFromCart(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        Cart cartItem = cartRepository.findByUserAndProduct(user, product)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found for product ID: " + productId));

        cartRepository.delete(cartItem);
    }

    private CartResponse mapToResponse(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .productId(cart.getProduct().getId())
                .productName(cart.getProduct().getName())
                .productPrice(cart.getProduct().getPrice())
                .quantity(cart.getQuantity())
                .build();
    }
}
