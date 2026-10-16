<?php
// Trakz PHP Backend - Merchant Controller

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';

class MerchantController {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    private function syncMerchantUsers() {
        try {
            // Delete dummy 'merch-new' or 'New Merchant Store' or 'User\'s Store' or 'gg store' duplicate entries if present
            $this->pdo->exec("DELETE FROM merchants WHERE id = 'merch-new' OR name = 'New Merchant Store' OR name = 'User\'s Store' OR name = 'My Store' OR name = 'gg store'");

            // Find any registered users with role 'merchant' that are not yet in the merchants table
            $stmt = $this->pdo->query("SELECT u.id, u.full_name, u.avatar FROM users u WHERE u.role = 'merchant' AND u.id NOT IN (SELECT id FROM merchants)");
            $missing = $stmt->fetchAll();

            foreach ($missing as $mUser) {
                if (empty($mUser['full_name'])) continue;
                $mId = $mUser['id'];
                $mName = $mUser['full_name'] . "'s Store";
                $category = 'burgers';
                $categoryName = 'BURGERS';
                $description = 'Delicious products & fresh local store delivery';
                $logo = $mUser['avatar'] ?: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80';
                $coverImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';
                $expiresAt = date('Y-m-d H:i:s', strtotime('+1 year'));

                $ins = $this->pdo->prepare("INSERT INTO merchants (id, name, description, logo, cover_image, category, category_name, is_open, rating, review_count, delivery_fee, estimated_delivery_time, distance_km, price_range, min_order_amount, is_featured, is_popular, registration_fee, is_registration_paid, membership_expires_at, tags, menu_categories) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 5.0, 1, 49.00, '20-30 min', '1.2 km', '$$', 100.00, 1, 1, 0.00, 1, ?, '[\"New Store\", \"Local Favorite\"]', '[\"Main Courses\", \"Beverages & Drinks\"]')");
                $ins->execute([$mId, $mName, $description, $logo, $coverImage, $category, $categoryName, $expiresAt]);
            }
        } catch (Exception $e) {
            // Silence sync errors
        }
    }

    public function getMerchants() {
        $this->syncMerchantUsers();

        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;
        $openOnly = isset($_GET['openOnly']) && $_GET['openOnly'] === 'true';
        $minRating = isset($_GET['minRating']) ? floatval($_GET['minRating']) : 0;
        $sortBy = $_GET['sortBy'] ?? 'rating';

        $query = "SELECT * FROM merchants WHERE 1=1";
        $params = [];

        if ($category && $category !== 'all') {
            $query .= " AND LOWER(category) = ?";
            $params[] = strtolower($category);
        }

        if ($search) {
            $query .= " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category_name) LIKE ?)";
            $searchTerm = '%' . strtolower($search) . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if ($openOnly) {
            $query .= " AND is_open = 1";
        }

        if ($minRating > 0) {
            $query .= " AND rating >= ?";
            $params[] = $minRating;
        }

        if ($sortBy === 'rating') {
            $query .= " ORDER BY rating DESC";
        } elseif ($sortBy === 'deliveryFee') {
            $query .= " ORDER BY delivery_fee ASC";
        } else {
            $query .= " ORDER BY rating DESC";
        }

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $merchants = array_map(function($r) {
            return [
                'id' => $r['id'],
                'name' => $r['name'],
                'description' => $r['description'],
                'logo' => $r['logo'],
                'coverImage' => $r['cover_image'],
                'category' => $r['category'],
                'categoryName' => $r['category_name'],
                'isOpen' => (bool)$r['is_open'],
                'rating' => (float)$r['rating'],
                'reviewCount' => (int)$r['review_count'],
                'deliveryFee' => (float)$r['delivery_fee'],
                'promoBadge' => $r['promo_badge'],
                'estimatedDeliveryTime' => $r['estimated_delivery_time'],
                'distanceKm' => $r['distance_km'],
                'priceRange' => $r['price_range'],
                'minOrderAmount' => (float)$r['min_order_amount'],
                'isFeatured' => (bool)$r['is_featured'],
                'isPopular' => (bool)$r['is_popular'],
                'brandColor' => $r['brand_color'] ?? null,
                'brandLetter' => $r['brand_letter'] ?? null,
                'registrationFee' => isset($r['registration_fee']) ? (float)$r['registration_fee'] : 999.00,
                'isRegistrationPaid' => isset($r['is_registration_paid']) ? (bool)$r['is_registration_paid'] : true,
                'membershipExpiresAt' => $r['membership_expires_at'] ?? date('Y-m-d H:i:s', strtotime('+1 year')),
                'address' => $r['address'] ?? 'Bonifacio High Street',
                'city' => $r['city'] ?? 'Taguig City',
                'latitude' => isset($r['latitude']) && $r['latitude'] !== null ? (float)$r['latitude'] : 14.5515,
                'longitude' => isset($r['longitude']) && $r['longitude'] !== null ? (float)$r['longitude'] : 121.0505,
                'tags' => json_decode($r['tags'] ?: '[]', true),
                'menuCategories' => json_decode($r['menu_categories'] ?: '[]', true)
            ];
        }, $rows);

        Response::json($merchants);
    }

    public function getMerchantById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM merchants WHERE id = ?");
        $stmt->execute([$id]);
        $r = $stmt->fetch();

        if (!$r) {
            // Check if user exists with role merchant
            $uStmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ? AND role = 'merchant'");
            $uStmt->execute([$id]);
            $u = $uStmt->fetch();
            if ($u) {
                $this->syncMerchantUsers();
                $stmt->execute([$id]);
                $r = $stmt->fetch();
            }
        }

        if (!$r) {
            Response::error('Merchant not found.', 404);
        }

        Response::json([
            'id' => $r['id'],
            'name' => $r['name'],
            'description' => $r['description'],
            'logo' => $r['logo'],
            'coverImage' => $r['cover_image'],
            'category' => $r['category'],
            'categoryName' => $r['category_name'],
            'isOpen' => (bool)$r['is_open'],
            'rating' => (float)$r['rating'],
            'reviewCount' => (int)$r['review_count'],
            'deliveryFee' => (float)$r['delivery_fee'],
            'promoBadge' => $r['promo_badge'],
            'estimatedDeliveryTime' => $r['estimated_delivery_time'],
            'distanceKm' => $r['distance_km'],
            'priceRange' => $r['price_range'],
            'minOrderAmount' => (float)$r['min_order_amount'],
            'isFeatured' => (bool)$r['is_featured'],
            'isPopular' => (bool)$r['is_popular'],
            'brandColor' => $r['brand_color'] ?? null,
            'brandLetter' => $r['brand_letter'] ?? null,
            'registrationFee' => isset($r['registration_fee']) ? (float)$r['registration_fee'] : 999.00,
            'isRegistrationPaid' => isset($r['is_registration_paid']) ? (bool)$r['is_registration_paid'] : true,
            'membershipExpiresAt' => $r['membership_expires_at'] ?? date('Y-m-d H:i:s', strtotime('+1 year')),
            'address' => $r['address'] ?? 'Bonifacio High Street',
            'city' => $r['city'] ?? 'Taguig City',
            'latitude' => isset($r['latitude']) && $r['latitude'] !== null ? (float)$r['latitude'] : 14.5515,
            'longitude' => isset($r['longitude']) && $r['longitude'] !== null ? (float)$r['longitude'] : 121.0505,
            'tags' => json_decode($r['tags'] ?: '[]', true),
            'menuCategories' => json_decode($r['menu_categories'] ?: '[]', true)
        ]);
    }

    public function createMerchant() {
        $data = json_decode(file_get_contents('php://input'), true);
        $name = trim($data['name'] ?? '');
        if (!$name) {
            Response::error('Merchant name is required.');
        }

        $id = $data['id'] ?? ('merch-' . time());
        $description = $data['description'] ?? 'Delicious products & fresh local store delivery';
        $logo = $data['logo'] ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80';
        $coverImage = $data['coverImage'] ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';
        $category = strtolower($data['category'] ?? 'burgers');
        $categoryName = strtoupper($category);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 year'));

        // Upsert into merchants table
        $stmt = $this->pdo->prepare("REPLACE INTO merchants (id, name, description, logo, cover_image, category, category_name, is_open, rating, review_count, delivery_fee, estimated_delivery_time, distance_km, price_range, min_order_amount, is_featured, is_popular, registration_fee, is_registration_paid, membership_expires_at, tags, menu_categories) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 5.0, 1, 49.00, '20-30 min', '1.2 km', '$$', 100.00, 1, 1, 0.00, 1, ?, '[\"New Store\", \"Local Favorite\"]', '[\"Main Courses\", \"Beverages & Drinks\"]')");
        $stmt->execute([$id, $name, $description, $logo, $coverImage, $category, $categoryName, $expiresAt]);

        Response::json(['success' => true, 'id' => $id, 'registrationFee' => 0.00, 'message' => 'Merchant saved to database successfully.']);
    }

    public function updateMerchant($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            Response::error('Invalid request body.');
        }

        $stmt = $this->pdo->prepare("SELECT * FROM merchants WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        $name = isset($data['name']) ? trim($data['name']) : ($existing['name'] ?? 'Store Outlet');
        $description = isset($data['description']) ? trim($data['description']) : ($existing['description'] ?? '');
        $logo = isset($data['logo']) && $data['logo'] ? $data['logo'] : ($existing['logo'] ?? '');
        $coverImage = isset($data['coverImage']) && $data['coverImage'] ? $data['coverImage'] : ($existing['cover_image'] ?? '');
        $category = isset($data['category']) ? strtolower($data['category']) : ($existing['category'] ?? 'burgers');
        $categoryName = strtoupper($category);
        $deliveryFee = isset($data['deliveryFee']) ? floatval($data['deliveryFee']) : floatval($existing['delivery_fee'] ?? 49.00);
        $estimatedDeliveryTime = isset($data['estimatedDeliveryTime']) ? $data['estimatedDeliveryTime'] : ($existing['estimated_delivery_time'] ?? '20-30 min');
        $minOrderAmount = isset($data['minOrderAmount']) ? floatval($data['minOrderAmount']) : floatval($existing['min_order_amount'] ?? 100.00);
        $promoBadge = isset($data['promoBadge']) ? $data['promoBadge'] : ($existing['promo_badge'] ?? null);

        $address = isset($data['address']) ? trim($data['address']) : ($existing['address'] ?? 'Bonifacio High Street');
        $city = isset($data['city']) ? trim($data['city']) : ($existing['city'] ?? 'Taguig City');
        $latitude = isset($data['latitude']) ? floatval($data['latitude']) : floatval($existing['latitude'] ?? 14.5515);
        $longitude = isset($data['longitude']) ? floatval($data['longitude']) : floatval($existing['longitude'] ?? 121.0505);

        // Ensure columns exist on merchants table
        try {
            $this->pdo->exec("ALTER TABLE `merchants` MODIFY `logo` LONGTEXT");
            $this->pdo->exec("ALTER TABLE `merchants` MODIFY `cover_image` LONGTEXT");
            $this->pdo->exec("ALTER TABLE `merchants` ADD COLUMN `address` VARCHAR(255) DEFAULT 'Bonifacio High Street'");
            $this->pdo->exec("ALTER TABLE `merchants` ADD COLUMN `city` VARCHAR(100) DEFAULT 'Taguig City'");
            $this->pdo->exec("ALTER TABLE `merchants` ADD COLUMN `latitude` DECIMAL(10,8) DEFAULT 14.55150000");
            $this->pdo->exec("ALTER TABLE `merchants` ADD COLUMN `longitude` DECIMAL(11,8) DEFAULT 121.05050000");
        } catch (Exception $e) {}

        if ($existing) {
            $up = $this->pdo->prepare("UPDATE merchants SET name = ?, description = ?, logo = ?, cover_image = ?, category = ?, category_name = ?, delivery_fee = ?, estimated_delivery_time = ?, min_order_amount = ?, promo_badge = ?, address = ?, city = ?, latitude = ?, longitude = ? WHERE id = ?");
            $up->execute([$name, $description, $logo, $coverImage, $category, $categoryName, $deliveryFee, $estimatedDeliveryTime, $minOrderAmount, $promoBadge, $address, $city, $latitude, $longitude, $id]);
        } else {
            $ins = $this->pdo->prepare("INSERT INTO merchants (id, name, description, logo, cover_image, category, category_name, is_open, rating, review_count, delivery_fee, estimated_delivery_time, distance_km, price_range, min_order_amount, is_featured, is_popular, registration_fee, is_registration_paid, promo_badge, address, city, latitude, longitude, tags, menu_categories) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 5.0, 1, ?, ?, '1.2 km', '$$', ?, 1, 1, 0.00, 1, ?, ?, ?, ?, ?, '[\"Store\", \"Local Favorite\"]', '[\"Main Courses\", \"Beverages & Drinks\"]')");
            $ins->execute([$id, $name, $description, $logo, $coverImage, $category, $categoryName, $deliveryFee, $estimatedDeliveryTime, $minOrderAmount, $promoBadge, $address, $city, $latitude, $longitude]);
        }

        // Also update corresponding user in users table if applicable
        try {
            $upUser = $this->pdo->prepare("UPDATE users SET full_name = ?, avatar = ? WHERE id = ? AND role = 'merchant'");
            $upUser->execute([$name, $logo, $id]);
        } catch (Exception $e) {}

        Response::json([
            'success' => true,
            'id' => $id,
            'message' => 'Store details updated successfully.'
        ]);
    }

    public function toggleStatus($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        $stmt = $this->pdo->prepare("SELECT is_open FROM merchants WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            Response::error('Merchant not found.', 404);
        }

        if (isset($data['isOpen'])) {
            $newStatus = $data['isOpen'] ? 1 : 0;
        } else {
            $newStatus = $row['is_open'] ? 0 : 1;
        }

        $up = $this->pdo->prepare("UPDATE merchants SET is_open = ? WHERE id = ?");
        $up->execute([$newStatus, $id]);

        Response::json(['success' => true, 'isOpen' => (bool)$newStatus]);
    }
}
