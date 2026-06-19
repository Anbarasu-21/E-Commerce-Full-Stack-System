$baseUrl = "http://localhost:8080/api"

# 1. Login as admin
$loginBody = @{
    email = "admin@ecommerce.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Add products
$products = @(
    @{ name="Wireless Noise-Cancelling Headphones"; description="Over-ear Bluetooth headphones with active noise cancellation"; price=199.99; quantity=30; categoryId=1 },
    @{ name="Smart Watch Series 7"; description="Fitness tracker with heart rate monitor and GPS"; price=249.50; quantity=20; categoryId=1 },
    @{ name="4K Ultra HD Smart TV"; description="55-inch LED TV with built-in streaming apps"; price=499.00; quantity=10; categoryId=1 },
    @{ name="Men's Casual Denim Jacket"; description="Classic fit blue denim jacket"; price=59.99; quantity=40; categoryId=2 },
    @{ name="Women's Running Shoes"; description="Lightweight athletic sneakers"; price=89.95; quantity=25; categoryId=2 },
    @{ name="Mechanical Gaming Keyboard"; description="RGB backlit wired keyboard with blue switches"; price=75.00; quantity=50; categoryId=1 }
)

foreach ($p in $products) {
    $body = $p | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -Headers $headers -Body $body
    Write-Host "Added product: $($p.name)"
}
