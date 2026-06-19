# E-Commerce Full-Stack System

A complete, production-ready E-Commerce application featuring a **Spring Boot** backend and a modern **React (Vite)** frontend. It includes authentication, role-based access control (RBAC), product and category management, a shopping cart, transactional checkouts, and order management.

---

## 🛠️ Tech Stack & Dependencies

### Backend
* **Language:** Java 17
* **Framework:** Spring Boot 3.2.5 (Spring Web, Spring Data JPA, Spring Security)
* **Database:** MySQL 8.0
* **Security:** JSON Web Token (JJWT 0.11.5)
* **API Documentation:** SpringDoc OpenAPI / Swagger UI
* **Other Tools:** Lombok, BCrypt Password Encoder

### Frontend
* **Framework:** React 18 (Bootstrapped with Vite)
* **Routing:** React Router DOM
* **HTTP Client:** Axios
* **Styling:** Custom Vanilla CSS with responsive design and modern UI aesthetics
* **Icons:** Lucide React

---

## 🚀 Key Features

### 🔒 1. Authentication & Security
* Secure user registration and login flows.
* Password hashing using **BCrypt**.
* Stateless token-based security via **JWT**, with claims including user roles and names.
* **Role-Based Access Control (RBAC):** Dedicated permissions and UI views for `CUSTOMER` and `ADMIN` roles.

### 📦 2. Product & Category Management
* Full CRUD endpoints and UI interfaces for categories and products (Admin only).
* Admins can create new categories on the fly, which instantly become available across the platform.
* Public endpoints to view and search the product catalog without logging in.
* Built-in server-side **Pagination**, **Sorting**, and **Keyword Searching**.

### 🛒 3. Shopping Cart Module
* Interactive cart operations: Add products to cart, update quantity, and remove items.
* Real-time inventory checks during cart additions.

### 💳 4. Order & Inventory Management
* **Transactional Checkout:** Placing an order aggregates cart items, calculates total price, clears the user's cart, and creates an order record in a safe, single transaction.
* **Auto Stock Reduction:** Verifies stock levels prior to checkout and automatically decrements inventory.
* **Order Tracking & Cancellation:** Customers can view their order history and cancel orders before they are shipped. Cancelled orders automatically restore product stock.
* **Admin Order Fulfillment:** Admins can view all customer orders and update shipping statuses (Processing, Shipped, Delivered, Cancelled).

---

## ⚙️ How to Run Locally

### Prerequisites
* Java JDK 17 or higher
* Node.js (v16+) and npm
* MySQL Server (running on port 3306)

### 1. Database Setup
1. Open your MySQL client or command line.
2. Create the database: `CREATE DATABASE ecommerce_db;`
3. Ensure your MySQL credentials match those in `backend/src/main/resources/application.properties` (Default: Username: `root`, Password: `test`).

### 2. Running the Backend
1. Open the `backend` folder in your Java IDE (IntelliJ, Eclipse, etc.).
2. Allow Maven to download dependencies.
3. Run `src/main/java/com/ecommerce/EcommerceApplication.java`.
4. The server will start on port `8080`.
*(Note: The backend automatically seeds sample categories, products, an admin account, and a customer account on the first run).*

### 3. Running the Frontend
1. Open a terminal and navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. The React application will be accessible at `http://localhost:5173`.

---

## 🧪 Testing the Application

### Seeded Test Accounts
On startup, a data initializer automatically seeds the database with the following accounts for immediate testing:
* **Admin Account:** `admin@ecommerce.com` / Password: `admin123`
* **Customer Account:** `customer@ecommerce.com` / Password: `customer123`

### Interactive API Documentation (Swagger)
You can test the raw backend endpoints directly using the built-in Swagger UI:
👉 **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**
