<?php
// Trakz PHP Backend - Product Controller

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';

class ProductController {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    public function getProductsByMerchant($merchantId) {
        $category = $_GET['category'] ?? null;

        $query = "SELECT * FROM products WHERE merchant_id = ? OR LOWER(merchant_name) = LOWER(?)";
        $params = [$merchantId, $merchantId];

        if ($category && $category !== 'All' && $category !== 'undefined' && $category !== 'null' && trim($category) !== '') {
            $query .= " AND LOWER(category) = ?";
            $params[] = strtolower($category);
        }

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $products = array_map(function($r) {
            return [
                'id' => $r['id'],
                'merchantId' => $r['merchant_id'],
                'merchantName' => $r['merchant_name'],
                'name' => $r['name'],
                'description' => $r['description'],
                'price' => (float)$r['price'],
                'image' => $r['image'],
                'category' => $r['category'],
                'rating' => (float)$r['rating'],
                'isPopular' => (bool)$r['is_popular'],
                'variants' => json_decode($r['variants'] ?: '[]', true),
                'addOns' => json_decode($r['add_ons'] ?: '[]', true)
            ];
        }, $rows);

        Response::json($products);
    }

    public function createProduct() {
        $data = json_decode(file_get_contents('php://input'), true);
        $name = trim($data['name'] ?? '');
        $merchantId = trim($data['merchantId'] ?? '');
        $merchantName = trim($data['merchantName'] ?? 'Store Partner');
        $price = floatval($data['price'] ?? 0);

        if (!$name || !$merchantId) {
            Response::error('Product name and merchant ID are required.');
        }

        $id = $data['id'] ?? ('prod-' . time());
        $description = $data['description'] ?? 'Freshly prepared item';
        $image = $data['image'] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
        $category = $data['category'] ?? 'Main Courses';
        $rating = floatval($data['rating'] ?? 5.0);
        $isPopular = isset($data['isPopular']) && $data['isPopular'] ? 1 : 0;
        $variants = json_encode($data['variants'] ?? []);
        $addOns = json_encode($data['addOns'] ?? []);

        // Ensure image column is LONGTEXT for Base64 / uploaded photos
        try {
            $this->pdo->exec("ALTER TABLE `products` MODIFY `image` LONGTEXT");
        } catch (Exception $e) {}

        // Ensure merchant exists in merchants table first to satisfy foreign key
        $mCheck = $this->pdo->prepare("SELECT id FROM merchants WHERE id = ? OR LOWER(name) = LOWER(?)");
        $mCheck->execute([$merchantId, $merchantName]);
        $mRow = $mCheck->fetch();

        $targetMerchantId = $mRow ? $mRow['id'] : $merchantId;

        if (!$mRow) {
            $mIns = $this->pdo->prepare("INSERT INTO merchants (id, name, description, logo, cover_image, category, category_name, is_open, rating, review_count, delivery_fee) VALUES (?, ?, 'Delicious products & fresh delivery', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', 'burgers', 'BURGERS', 1, 5.0, 1, 49.00)");
            $mIns->execute([$targetMerchantId, $merchantName]);
        }

        try {
            $stmt = $this->pdo->prepare("REPLACE INTO products (id, merchant_id, merchant_name, name, description, price, image, category, rating, is_popular, variants, add_ons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $targetMerchantId, $merchantName, $name, $description, $price, $image, $category, $rating, $isPopular, $variants, $addOns]);
        } catch (Exception $e) {
            // Fallback image if data too long or specific image error occurs
            $fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
            $stmt = $this->pdo->prepare("REPLACE INTO products (id, merchant_id, merchant_name, name, description, price, image, category, rating, is_popular, variants, add_ons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $targetMerchantId, $merchantName, $name, $description, $price, $fallbackImage, $category, $rating, $isPopular, $variants, $addOns]);
        }

        Response::json([
            'success' => true,
            'id' => $id,
            'message' => 'Product added to store catalog in database.'
        ], 201);
    }

    public function updateProduct($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            Response::error('Invalid request body.');
        }

        try {
            $this->pdo->exec("ALTER TABLE `products` MODIFY `image` LONGTEXT");
        } catch (Exception $e) {}

        // Check if product exists
        $stmtCheck = $this->pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmtCheck->execute([$id]);
        $existing = $stmtCheck->fetch();

        if (!$existing) {
            // Upsert / insert if it didn't exist in DB before (e.g. mock product or custom product)
            $merchantId = $data['merchantId'] ?? 'merch-new';
            $merchantName = $data['merchantName'] ?? 'Store Partner';
            $name = trim($data['name'] ?? 'Updated Product');
            $description = $data['description'] ?? 'Freshly prepared item';
            $price = floatval($data['price'] ?? 0);
            $image = $data['image'] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
            $category = $data['category'] ?? 'Main Courses';
            $rating = floatval($data['rating'] ?? 5.0);
            $isPopular = !empty($data['isPopular']) ? 1 : 0;
            $variants = json_encode($data['variants'] ?? []);
            $addOns = json_encode($data['addOns'] ?? []);

            try {
                $up = $this->pdo->prepare("REPLACE INTO products (id, merchant_id, merchant_name, name, description, price, image, category, rating, is_popular, variants, add_ons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $up->execute([$id, $merchantId, $merchantName, $name, $description, $price, $image, $category, $rating, $isPopular, $variants, $addOns]);
            } catch (Exception $e) {
                $fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                $up = $this->pdo->prepare("REPLACE INTO products (id, merchant_id, merchant_name, name, description, price, image, category, rating, is_popular, variants, add_ons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $up->execute([$id, $merchantId, $merchantName, $name, $description, $price, $fallbackImage, $category, $rating, $isPopular, $variants, $addOns]);
            }
        } else {
            $name = isset($data['name']) ? trim($data['name']) : $existing['name'];
            $description = isset($data['description']) ? $data['description'] : $existing['description'];
            $price = isset($data['price']) ? floatval($data['price']) : (float)$existing['price'];
            $image = isset($data['image']) && $data['image'] ? $data['image'] : $existing['image'];
            $category = isset($data['category']) ? $data['category'] : $existing['category'];

            try {
                $up = $this->pdo->prepare("UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ? WHERE id = ?");
                $up->execute([$name, $description, $price, $image, $category, $id]);
            } catch (Exception $e) {
                // Fallback image if Base64 fails
                $fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                $up = $this->pdo->prepare("UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ? WHERE id = ?");
                $up->execute([$name, $description, $price, $fallbackImage, $category, $id]);
            }
        }

        Response::json([
            'success' => true,
            'id' => $id,
            'message' => 'Product updated successfully.'
        ]);
    }

    public function deleteProduct($id) {
        $stmt = $this->pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        Response::json([
            'success' => true,
            'id' => $id,
            'message' => 'Product deleted successfully.'
        ]);
    }

    public function getPopularProducts() {
        $stmt = $this->pdo->query("SELECT * FROM products WHERE is_popular = 1");
        $rows = $stmt->fetchAll();

        $products = array_map(function($r) {
            return [
                'id' => $r['id'],
                'merchantId' => $r['merchant_id'],
                'merchantName' => $r['merchant_name'],
                'name' => $r['name'],
                'description' => $r['description'],
                'price' => (float)$r['price'],
                'image' => $r['image'],
                'category' => $r['category'],
                'rating' => (float)$r['rating'],
                'isPopular' => (bool)$r['is_popular'],
                'variants' => json_decode($r['variants'] ?: '[]', true),
                'addOns' => json_decode($r['add_ons'] ?: '[]', true)
            ];
        }, $rows);

        Response::json($products);
    }

    public function searchProducts() {
        $q = $_GET['q'] ?? '';
        $searchTerm = '%' . strtolower($q) . '%';

        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(merchant_name) LIKE ?");
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
        $rows = $stmt->fetchAll();

        $products = array_map(function($r) {
            return [
                'id' => $r['id'],
                'merchantId' => $r['merchant_id'],
                'merchantName' => $r['merchant_name'],
                'name' => $r['name'],
                'description' => $r['description'],
                'price' => (float)$r['price'],
                'image' => $r['image'],
                'category' => $r['category'],
                'rating' => (float)$r['rating'],
                'isPopular' => (bool)$r['is_popular'],
                'variants' => json_decode($r['variants'] ?: '[]', true),
                'addOns' => json_decode($r['add_ons'] ?: '[]', true)
            ];
        }, $rows);

        Response::json($products);
    }
}
