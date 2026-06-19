package com.ecommerce.controller;

import com.ecommerce.dto.request.CartRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CartResponse>>> getCart(@AuthenticationPrincipal User user) {
        List<CartResponse> cart = cartService.getCart(user);
        return ResponseEntity.ok(ApiResponse.<List<CartResponse>>builder()
                .success(true)
                .message("Cart retrieved successfully")
                .data(cart)
                .build());
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CartRequest request
    ) {
        CartResponse cartItem = cartService.addToCart(user, request);
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Product added to cart successfully")
                .data(cartItem)
                .build());
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId
    ) {
        cartService.removeFromCart(user, productId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Product removed from cart successfully")
                .build());
    }
}
