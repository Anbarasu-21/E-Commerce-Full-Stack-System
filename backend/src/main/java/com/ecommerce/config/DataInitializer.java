package com.ecommerce.config;

import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles / Users
        if (!userRepository.existsByEmail("admin@ecommerce.com")) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@ecommerce.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded Admin user: admin@ecommerce.com / admin123");
        }

        if (!userRepository.existsByEmail("customer@ecommerce.com")) {
            User customer = User.builder()
                    .name("Jane Doe")
                    .email("customer@ecommerce.com")
                    .password(passwordEncoder.encode("customer123"))
                    .role(Role.CUSTOMER)
                    .build();
            userRepository.save(customer);
            System.out.println("Seeded Customer user: customer@ecommerce.com / customer123");
        }

        // 2. Seed Categories
        if (categoryRepository.count() == 0) {
            Category electronics = Category.builder()
                    .name("Electronics")
                    .description("Gadgets, laptops, smartphones and accessories")
                    .build();

            Category clothing = Category.builder()
                    .name("Clothing")
                    .description("Men's and women's apparel")
                    .build();

            categoryRepository.saveAll(List.of(electronics, clothing));
            System.out.println("Seeded starting categories: Electronics, Clothing");
        }

        // 3. Seed Products
        if (productRepository.count() == 0) {
            Category electronics = categoryRepository.findByName("Electronics")
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            Category clothing = categoryRepository.findByName("Clothing")
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            Product laptop = Product.builder()
                    .name("Premium Ultrabook Laptop")
                    .description("14-inch, 16GB RAM, 512GB SSD high-performance laptop")
                    .price(new BigDecimal("999.99"))
                    .quantity(10)
                    .category(electronics)
                    .build();

            Product phone = Product.builder()
                    .name("Smartphone X")
                    .description("6.5-inch OLED screen, 128GB storage flagship mobile phone")
                    .price(new BigDecimal("799.49"))
                    .quantity(15)
                    .category(electronics)
                    .build();

            Product tshirt = Product.builder()
                    .name("Classic Cotton T-Shirt")
                    .description("100% breathable organic cotton t-shirt in black")
                    .price(new BigDecimal("19.99"))
                    .quantity(50)
                    .category(clothing)
                    .build();

            productRepository.saveAll(List.of(laptop, phone, tshirt));
            System.out.println("Seeded starting products: Premium Ultrabook Laptop, Smartphone X, Classic Cotton T-Shirt");
        }
    }
}
