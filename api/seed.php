<?php
// Trakz Database Reset & Seeder Script
require_once __DIR__ . '/config/database.php';

function clearDatabase() {
    $pdo = Database::getInstance();
    $tables = ['orders', 'products', 'merchants', 'addresses', 'notifications', 'users'];

    foreach ($tables as $t) {
        try {
            $pdo->exec("DELETE FROM `{$t}`");
        } catch (Exception $e) {}
    }

    // Keep 1 default Super Admin so you can log in and manage your fresh system
    $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (id, full_name, email, phone, password_hash, role, status, avatar) VALUES (?, ?, ?, ?, ?, 'admin', 'active', ?)");
    $stmt->execute([
        'admin-100',
        'System Super Admin',
        'admin@trakz.com',
        '+63 917 888 9999',
        $passwordHash,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    ]);
}

function seedDatabase($force = false) {
    if (!$force) {
        // Do not auto-inject demo data on standard API requests
        return;
    }

    $pdo = Database::getInstance();
    $userId = 'cust-101';

    // 1. Seed Accounts (Admin, Customer, Merchant, Rider)
    $passwordHash = password_hash('password123', PASSWORD_DEFAULT);

    $usersToSeed = [
        [
            'id' => 'admin-100',
            'full_name' => 'System Super Admin',
            'email' => 'admin@trakz.com',
            'phone' => '+63 917 888 9999',
            'role' => 'admin',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        ],
        [
            'id' => 'cust-101',
            'full_name' => 'Default User',
            'email' => 'user@example.com',
            'phone' => '+63 917 123 4567',
            'role' => 'customer',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        ],
        [
            'id' => 'merch-1',
            'full_name' => 'Burger Craft Owner',
            'email' => 'merchant@burgercraft.com',
            'phone' => '+63 918 888 7777',
            'role' => 'merchant',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80'
        ],
        [
            'id' => 'rider-1',
            'full_name' => 'Marco Santos',
            'email' => 'marco.santos@trakz.com',
            'phone' => '+63 919 444 8888',
            'role' => 'rider',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        ]
    ];

    $userStmt = $pdo->prepare("REPLACE INTO users (id, full_name, email, phone, password_hash, role, status, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($usersToSeed as $u) {
        $userStmt->execute([
            $u['id'],
            $u['full_name'],
            $u['email'],
            $u['phone'],
            $passwordHash,
            $u['role'],
            $u['status'],
            $u['avatar']
        ]);
    }

    // 2. Seed Merchants
    $merchants = [
        [
            'id' => 'merch-jollibee',
            'name' => 'Jollibee',
            'description' => 'Bida ang Saya! Famous Crispy Chickenjoy & Jolly Spaghetti.',
            'logo' => 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=200&q=80',
            'cover_image' => 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80',
            'category' => 'chicken',
            'category_name' => 'Chicken & Fast Food',
            'is_open' => 1,
            'rating' => 4.9,
            'review_count' => 1250,
            'delivery_fee' => 0.00,
            'promo_badge' => 'Free Delivery',
            'estimated_delivery_time' => '20-25 min',
            'distance_km' => '1.2 km',
            'price_range' => '$$',
            'min_order_amount' => 150.00,
            'is_featured' => 1,
            'is_popular' => 1,
            'brand_color' => 'from-red-600 to-orange-500',
            'brand_letter' => '🐝',
            'tags' => json_encode(['Chickenjoy', 'Free Delivery', 'Best Seller']),
            'menu_categories' => json_encode(['Chickenjoy Bucket', 'Jolly Spaghetti', 'Yumburger', 'Drinks & Sundae'])
        ],
        [
            'id' => 'merch-mcdo',
            'name' => "McDonald's PH",
            'description' => "Love ko 'to! World famous fries, Big Mac & McFlurry.",
            'logo' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
            'cover_image' => 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80',
            'category' => 'burgers',
            'category_name' => 'Burgers & Fries',
            'is_open' => 1,
            'rating' => 4.8,
            'review_count' => 980,
            'delivery_fee' => 20.00,
            'promo_badge' => '₱20 Off',
            'estimated_delivery_time' => '15-20 min',
            'distance_km' => '0.8 km',
            'price_range' => '$$',
            'min_order_amount' => 150.00,
            'is_featured' => 1,
            'is_popular' => 1,
            'brand_color' => 'from-red-600 to-amber-500',
            'brand_letter' => 'M',
            'tags' => json_encode(['Big Mac', '₱20 Off', 'World Famous Fries']),
            'menu_categories' => json_encode(['Burgers', 'McChicken & Nuggets', 'Fries & Sides', 'Desserts & McFlurry'])
        ],
        [
            'id' => 'merch-1',
            'name' => 'Burger Craft & Grills',
            'description' => 'Juicy smashed gourmet beef burgers, loaded fries, and craft milkshakes.',
            'logo' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
            'cover_image' => 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80',
            'category' => 'burgers',
            'category_name' => 'Burgers & American',
            'is_open' => 1,
            'rating' => 4.8,
            'review_count' => 342,
            'delivery_fee' => 49.00,
            'promo_badge' => NULL,
            'estimated_delivery_time' => '20 - 30 min',
            'distance_km' => '1.4 km',
            'price_range' => '$$',
            'min_order_amount' => 150.00,
            'is_featured' => 1,
            'is_popular' => 1,
            'brand_color' => NULL,
            'brand_letter' => NULL,
            'tags' => json_encode(['Gourmet Burgers', 'Fastest', 'Top Rated']),
            'menu_categories' => json_encode(['Popular Items', 'Gourmet Burgers', 'Sides & Fries', 'Milkshakes & Beverages'])
        ],
        [
            'id' => 'merch-2',
            'name' => 'Bella Napoli Woodfired Pizza',
            'description' => 'Authentic Neapolitan sourdough pizza baked in stone oven at 900°F.',
            'logo' => 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=200&q=80',
            'cover_image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
            'category' => 'pizza',
            'category_name' => 'Pizza & Italian',
            'is_open' => 1,
            'rating' => 4.9,
            'review_count' => 520,
            'delivery_fee' => 39.00,
            'promo_badge' => NULL,
            'estimated_delivery_time' => '25 - 35 min',
            'distance_km' => '2.1 km',
            'price_range' => '$$$',
            'min_order_amount' => 250.00,
            'is_featured' => 1,
            'is_popular' => 1,
            'brand_color' => NULL,
            'brand_letter' => NULL,
            'tags' => json_encode(['Woodfired Pizza', 'Free Delivery Promo', 'Authentic Italian']),
            'menu_categories' => json_encode(['Chef Signature Pizzas', 'Classic Pizzas', 'Pasta & Lasagna', 'Italian Drinks'])
        ],
        [
            'id' => 'merch-3',
            'name' => 'Boba Haven & Tea House',
            'description' => 'Handcrafted brown sugar boba, fresh fruit teas, and matcha lattes.',
            'logo' => 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=200&q=80',
            'cover_image' => 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=1200&q=80',
            'category' => 'milktea',
            'category_name' => 'Milk Tea & Beverages',
            'is_open' => 1,
            'rating' => 4.7,
            'review_count' => 280,
            'delivery_fee' => 29.00,
            'promo_badge' => 'Buy 1 Get 1',
            'estimated_delivery_time' => '15 - 25 min',
            'distance_km' => '0.9 km',
            'price_range' => '$',
            'min_order_amount' => 100.00,
            'is_featured' => 0,
            'is_popular' => 1,
            'brand_color' => NULL,
            'brand_letter' => NULL,
            'tags' => json_encode(['Fresh Boba', 'Fruit Teas', 'Buy 1 Get 1']),
            'menu_categories' => json_encode(['Signature Milk Teas', 'Fresh Fruit Series', 'Matcha & Coffee', 'Snacks & Waffles'])
        ],
        [
            'id' => 'merch-4',
            'name' => 'Tokyo Ramen & Donburi Express',
            'description' => 'Rich 12-hour tonkotsu broth ramen, crispy chicken katsu, and fresh bowls.',
            'logo' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=200&q=80',
            'cover_image' => 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80',
            'category' => 'asian',
            'category_name' => 'Japanese & Asian',
            'is_open' => 1,
            'rating' => 4.8,
            'review_count' => 410,
            'delivery_fee' => 45.00,
            'promo_badge' => NULL,
            'estimated_delivery_time' => '25 - 40 min',
            'distance_km' => '2.8 km',
            'price_range' => '$$',
            'min_order_amount' => 200.00,
            'is_featured' => 1,
            'is_popular' => 0,
            'brand_color' => NULL,
            'brand_letter' => NULL,
            'tags' => json_encode(['Tonkotsu Ramen', 'Katsu Don', 'Authentic']),
            'menu_categories' => json_encode(['Ramen Special', 'Donburi Rice Bowls', 'Gyoza & Appetizers', 'Japanese Drinks'])
        ]
    ];

    $stmtM = $pdo->prepare("REPLACE INTO merchants (id, name, description, logo, cover_image, category, category_name, is_open, rating, review_count, delivery_fee, promo_badge, estimated_delivery_time, distance_km, price_range, min_order_amount, is_featured, is_popular, brand_color, brand_letter, tags, menu_categories) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    foreach ($merchants as $m) {
        $stmtM->execute([
            $m['id'], $m['name'], $m['description'], $m['logo'], $m['cover_image'],
            $m['category'], $m['category_name'], $m['is_open'], $m['rating'], $m['review_count'],
            $m['delivery_fee'], $m['promo_badge'], $m['estimated_delivery_time'], $m['distance_km'],
            $m['price_range'], $m['min_order_amount'], $m['is_featured'], $m['is_popular'],
            $m['brand_color'], $m['brand_letter'], $m['tags'], $m['menu_categories']
        ]);
    }

    // 3. Seed Products
    $products = [
        // MCDONALD'S PH
        [
            'id' => 'prod-mcdo-1',
            'merchant_id' => 'merch-mcdo',
            'merchant_name' => "McDonald's PH",
            'name' => 'Big Mac Meal',
            'description' => 'Two 100% pure beef patties, Big Mac sauce, lettuce, cheese, pickles and onions with fries & drink.',
            'price' => 245.00,
            'image' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
            'category' => 'Burgers',
            'rating' => 4.8,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'Medium Meal', 'price' => 0],
                ['id' => 'v2', 'name' => 'Large Meal', 'price' => 30]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra Cheese Slice', 'price' => 20]
            ])
        ],
        [
            'id' => 'prod-mcdo-2',
            'merchant_id' => 'merch-mcdo',
            'merchant_name' => "McDonald's PH",
            'name' => 'Double Cheeseburger Meal',
            'description' => 'Two 100% pure beef patties, melted American cheese, pickles, minced onions, ketchup and mustard.',
            'price' => 185.00,
            'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
            'category' => 'Burgers',
            'rating' => 4.7,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'Medium Meal', 'price' => 0],
                ['id' => 'v2', 'name' => 'Large Meal', 'price' => 25]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra Pickle Slices', 'price' => 15]
            ])
        ],
        [
            'id' => 'prod-mcdo-3',
            'merchant_id' => 'merch-mcdo',
            'merchant_name' => "McDonald's PH",
            'name' => '6-pc McNuggets Meal',
            'description' => '6 tender white meat chicken McNuggets with signature Tangy BBQ or Sweet & Sour sauce.',
            'price' => 175.00,
            'image' => 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
            'category' => 'McChicken & Nuggets',
            'rating' => 4.9,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => '6-piece', 'price' => 0],
                ['id' => 'v2', 'name' => '10-piece', 'price' => 60]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra BBQ Dip', 'price' => 15]
            ])
        ],
        [
            'id' => 'prod-mcdo-4',
            'merchant_id' => 'merch-mcdo',
            'merchant_name' => "McDonald's PH",
            'name' => 'McChicken Sandwich Meal',
            'description' => 'Crispy chicken patty topped with shredded lettuce and creamy mayonnaise on a toasted sesame seed bun.',
            'price' => 165.00,
            'image' => 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
            'category' => 'McChicken & Nuggets',
            'rating' => 4.8,
            'is_popular' => 0,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'Regular Meal', 'price' => 0]
            ]),
            'add_ons' => json_encode([])
        ],
        [
            'id' => 'prod-mcdo-5',
            'merchant_id' => 'merch-mcdo',
            'merchant_name' => "McDonald's PH",
            'name' => 'World Famous Fries (Large)',
            'description' => 'Golden on the outside, soft and fluffy on the inside. Salted to perfection.',
            'price' => 95.00,
            'image' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
            'category' => 'Fries & Sides',
            'rating' => 4.9,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'Medium', 'price' => -20],
                ['id' => 'v2', 'name' => 'Large', 'price' => 0],
                ['id' => 'v3', 'name' => 'BFF Fries', 'price' => 70]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Shake Shake Powder - BBQ', 'price' => 15],
                ['id' => 'a2', 'name' => 'Shake Shake Powder - Cheese', 'price' => 15]
            ])
        ],
        [
            'id' => 'prod-mcdo-6',
            'merchant_id' => 'merch-mcdo',
            'merchant_name' => "McDonald's PH",
            'name' => 'Oreo McFlurry',
            'description' => 'Creamy vanilla soft serve blended with crunchy Oreo cookie crumbles.',
            'price' => 65.00,
            'image' => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
            'category' => 'Desserts & McFlurry',
            'rating' => 4.9,
            'is_popular' => 1,
            'variants' => json_encode([]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra Oreo Crumbles', 'price' => 20]
            ])
        ],

        // JOLLIBEE
        [
            'id' => 'prod-jollibee-1',
            'merchant_id' => 'merch-jollibee',
            'merchant_name' => 'Jollibee',
            'name' => '6-pc Chickenjoy Bucket',
            'description' => '6 pieces of crispy, juicy Chickenjoy served with savory gravy.',
            'price' => 499.00,
            'image' => 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
            'category' => 'Chickenjoy Bucket',
            'rating' => 4.9,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'All Original', 'price' => 0],
                ['id' => 'v2', 'name' => 'All Spicy', 'price' => 20]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra Gravy', 'price' => 15],
                ['id' => 'a2', 'name' => 'Extra Steamed Rice', 'price' => 35]
            ])
        ],
        [
            'id' => 'prod-jollibee-2',
            'merchant_id' => 'merch-jollibee',
            'merchant_name' => 'Jollibee',
            'name' => '1-pc Chickenjoy with Rice & Drink',
            'description' => '1 piece of iconic crispy Chickenjoy with steamed white rice and drink.',
            'price' => 99.00,
            'image' => 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
            'category' => 'Chickenjoy Bucket',
            'rating' => 4.8,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'Original', 'price' => 0],
                ['id' => 'v2', 'name' => 'Spicy', 'price' => 5]
            ]),
            'add_ons' => json_encode([])
        ],
        [
            'id' => 'prod-jollibee-3',
            'merchant_id' => 'merch-jollibee',
            'merchant_name' => 'Jollibee',
            'name' => 'Jolly Spaghetti Family Pan',
            'description' => 'Sweet-style spaghetti sauce with hotdog slices, ham, and melted cheese top.',
            'price' => 260.00,
            'image' => 'https://images.unsplash.com/photo-1621996346565-e3def616327d?auto=format&fit=crop&w=600&q=80',
            'category' => 'Jolly Spaghetti',
            'rating' => 4.9,
            'is_popular' => 1,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ],
        [
            'id' => 'prod-jollibee-4',
            'merchant_id' => 'merch-jollibee',
            'merchant_name' => 'Jollibee',
            'name' => 'Jolly Spaghetti with Yumburger Combo',
            'description' => 'Sweet Jolly Spaghetti paired with classic beefy Yumburger and cold beverage.',
            'price' => 125.00,
            'image' => 'https://images.unsplash.com/photo-1621996346565-e3def616327d?auto=format&fit=crop&w=600&q=80',
            'category' => 'Jolly Spaghetti',
            'rating' => 4.8,
            'is_popular' => 1,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ],
        [
            'id' => 'prod-jollibee-5',
            'merchant_id' => 'merch-jollibee',
            'merchant_name' => 'Jollibee',
            'name' => 'Cheesy Yumburger Meal',
            'description' => '100% beef patty with signature dressing and melted cheese slice.',
            'price' => 85.00,
            'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
            'category' => 'Yumburger',
            'rating' => 4.7,
            'is_popular' => 1,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ],
        [
            'id' => 'prod-jollibee-6',
            'merchant_id' => 'merch-jollibee',
            'merchant_name' => 'Jollibee',
            'name' => 'Chocolate Sundae & Coke Float',
            'description' => 'Vanilla soft serve with hot fudge chocolate drizzle or Coke Float.',
            'price' => 55.00,
            'image' => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
            'category' => 'Drinks & Sundae',
            'rating' => 4.8,
            'is_popular' => 0,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ],

        // BURGER CRAFT & GRILLS
        [
            'id' => 'prod-101',
            'merchant_id' => 'merch-1',
            'merchant_name' => 'Burger Craft & Grills',
            'name' => 'Trakz Supreme Double Smash Burger',
            'description' => 'Double grass-fed beef smash patties, double cheddar cheese, caramelized onions, smoked bacon & signature house sauce.',
            'price' => 289.00,
            'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
            'category' => 'Popular Items',
            'rating' => 4.9,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'Single Patty', 'price' => 0],
                ['id' => 'v2', 'name' => 'Double Patty', 'price' => 70],
                ['id' => 'v3', 'name' => 'Triple Monster', 'price' => 140]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra Crispy Bacon', 'price' => 45],
                ['id' => 'a2', 'name' => 'Melted Truffle Cheese', 'price' => 50]
            ])
        ],
        [
            'id' => 'prod-102',
            'merchant_id' => 'merch-1',
            'merchant_name' => 'Burger Craft & Grills',
            'name' => 'Truffle Mushroom Cheeseburger',
            'description' => 'Single Angus patty topped with wild sautéed mushrooms, Swiss cheese, and fragrant black truffle mayo.',
            'price' => 310.00,
            'image' => 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
            'category' => 'Gourmet Burgers',
            'rating' => 4.8,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'Single Patty', 'price' => 0],
                ['id' => 'v2', 'name' => 'Double Patty', 'price' => 70]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra Bacon', 'price' => 45],
                ['id' => 'a2', 'name' => 'Extra Truffle Mayo', 'price' => 25]
            ])
        ],
        [
            'id' => 'prod-103',
            'merchant_id' => 'merch-1',
            'merchant_name' => 'Burger Craft & Grills',
            'name' => 'Loaded Cajun Cheese Fries',
            'description' => 'Golden skin-on fries tossed in spicy Cajun seasoning, smothered with warm cheddar cheese sauce and bacon bits.',
            'price' => 145.00,
            'image' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
            'category' => 'Sides & Fries',
            'rating' => 4.7,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'Regular Size', 'price' => 0],
                ['id' => 'v2', 'name' => 'Sharing Size', 'price' => 50]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra Cheese Sauce', 'price' => 25],
                ['id' => 'a2', 'name' => 'Jalapeños', 'price' => 20]
            ])
        ],
        [
            'id' => 'prod-104',
            'merchant_id' => 'merch-1',
            'merchant_name' => 'Burger Craft & Grills',
            'name' => 'Thick Salted Caramel Milkshake',
            'description' => 'Hand-spun vanilla bean ice cream blended with house-made salted caramel and whipped cream.',
            'price' => 165.00,
            'image' => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
            'category' => 'Milkshakes & Beverages',
            'rating' => 4.8,
            'is_popular' => 0,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ],

        // BELLA NAPOLI
        [
            'id' => 'prod-201',
            'merchant_id' => 'merch-2',
            'merchant_name' => 'Bella Napoli Woodfired Pizza',
            'name' => 'Truffle Prosciutto Speciale Pizza 12"',
            'description' => 'Fresh mozzarella, San Marzano tomato sauce, aged prosciutto di Parma, wild rocket arugula, and white truffle oil spray.',
            'price' => 495.00,
            'image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
            'category' => 'Chef Signature Pizzas',
            'rating' => 4.9,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => '12-inch Personal (8 slices)', 'price' => 0],
                ['id' => 'v2', 'name' => '16-inch Family (12 slices)', 'price' => 180]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra Mozzarella Di Bufala', 'price' => 60],
                ['id' => 'a2', 'name' => 'Hot Honey Drizzle', 'price' => 35],
                ['id' => 'a3', 'name' => 'Garlic Butter Crust Dip', 'price' => 25]
            ])
        ],
        [
            'id' => 'prod-202',
            'merchant_id' => 'merch-2',
            'merchant_name' => 'Bella Napoli Woodfired Pizza',
            'name' => 'Classic Margherita Supreme',
            'description' => 'San Marzano tomatoes, fresh basil leaves, extra virgin olive oil, and melted Italian mozzarella.',
            'price' => 380.00,
            'image' => 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
            'category' => 'Classic Pizzas',
            'rating' => 4.8,
            'is_popular' => 1,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ],
        [
            'id' => 'prod-203',
            'merchant_id' => 'merch-2',
            'merchant_name' => 'Bella Napoli Woodfired Pizza',
            'name' => 'Creamy Truffle Mushroom Lasagna',
            'description' => 'Layers of fresh pasta, rich parmesan béchamel sauce, roasted forest mushrooms, and braised beef ragù.',
            'price' => 340.00,
            'image' => 'https://images.unsplash.com/photo-1621996346565-e3def616327d?auto=format&fit=crop&w=600&q=80',
            'category' => 'Pasta & Lasagna',
            'rating' => 4.7,
            'is_popular' => 0,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ],
        [
            'id' => 'prod-204',
            'merchant_id' => 'merch-2',
            'merchant_name' => 'Bella Napoli Woodfired Pizza',
            'name' => 'Sparkling San Pellegrino Lemonade',
            'description' => 'Imported Italian sparkling lemon fruit beverage (330ml can).',
            'price' => 120.00,
            'image' => 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80',
            'category' => 'Italian Drinks',
            'rating' => 4.8,
            'is_popular' => 0,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ],

        // BOBA HAVEN
        [
            'id' => 'prod-301',
            'merchant_id' => 'merch-3',
            'merchant_name' => 'Boba Haven & Tea House',
            'name' => 'Brown Sugar Fresh Milk Boba',
            'description' => 'Warm slow-cooked tapioca boba coated in rich brown sugar syrup, layered with cold fresh dairy milk and mousse top.',
            'price' => 135.00,
            'image' => 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80',
            'category' => 'Signature Milk Teas',
            'rating' => 4.9,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'Medium 16oz', 'price' => 0],
                ['id' => 'v2', 'name' => 'Large 22oz', 'price' => 20]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra Brown Sugar Boba', 'price' => 25],
                ['id' => 'a2', 'name' => 'Cheese Mousse Foam', 'price' => 30]
            ])
        ],
        [
            'id' => 'prod-302',
            'merchant_id' => 'merch-3',
            'merchant_name' => 'Boba Haven & Tea House',
            'name' => 'Mango Passionfruit Chezzo Fruit Tea',
            'description' => 'Real brewed jasmine green tea infused with fresh mango puree and passionfruit seeds, topped with salted cheese top.',
            'price' => 145.00,
            'image' => 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80',
            'category' => 'Fresh Fruit Series',
            'rating' => 4.8,
            'is_popular' => 1,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ],
        [
            'id' => 'prod-303',
            'merchant_id' => 'merch-3',
            'merchant_name' => 'Boba Haven & Tea House',
            'name' => 'Kyoto Uji Matcha Oat Latte',
            'description' => 'Premium Ceremonial grade Uji matcha whisked with creamy oat milk.',
            'price' => 155.00,
            'image' => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
            'category' => 'Matcha & Coffee',
            'rating' => 4.9,
            'is_popular' => 0,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ],

        // TOKYO RAMEN
        [
            'id' => 'prod-401',
            'merchant_id' => 'merch-4',
            'merchant_name' => 'Tokyo Ramen & Donburi Express',
            'name' => 'Signature Tonkotsu Black Garlic Ramen',
            'description' => '12-hour simmered pork bone broth, thin handmade ramen noodles, chashu pork belly slices, ajitsuke tamago egg, wood ear mushroom, and black garlic oil.',
            'price' => 360.00,
            'image' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
            'category' => 'Ramen Special',
            'rating' => 4.9,
            'is_popular' => 1,
            'variants' => json_encode([
                ['id' => 'v1', 'name' => 'Regular Spice', 'price' => 0],
                ['id' => 'v2', 'name' => 'Extra Spicy Level 2', 'price' => 15]
            ]),
            'add_ons' => json_encode([
                ['id' => 'a1', 'name' => 'Extra Chashu Pork (2 pcs)', 'price' => 65]
            ])
        ],
        [
            'id' => 'prod-402',
            'merchant_id' => 'merch-4',
            'merchant_name' => 'Tokyo Ramen & Donburi Express',
            'name' => 'Crispy Chicken Katsu Don',
            'description' => 'Deep-fried chicken cutlet simmered in sweet dashi soy broth with egg and onions over hot steamed rice.',
            'price' => 280.00,
            'image' => 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
            'category' => 'Donburi Rice Bowls',
            'rating' => 4.8,
            'is_popular' => 1,
            'variants' => json_encode([]),
            'add_ons' => json_encode([])
        ]
    ];

    $stmtP = $pdo->prepare("REPLACE INTO products (id, merchant_id, merchant_name, name, description, price, image, category, rating, is_popular, variants, add_ons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    foreach ($products as $p) {
        $stmtP->execute([
            $p['id'], $p['merchant_id'], $p['merchant_name'], $p['name'], $p['description'],
            $p['price'], $p['image'], $p['category'], $p['rating'], $p['is_popular'],
            $p['variants'], $p['add_ons']
        ]);
    }

    // 4. Seed Addresses
    $pdo->prepare("REPLACE INTO addresses (id, customer_id, label, street, barangay, city, postal_code, delivery_instructions, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        ->execute([
            'addr-1', $userId, 'Home', 'Bonifacio High Street', 'BGC', 'Taguig City', '1634', 'Leave at reception counter.', 1
        ]);

    // 5. Seed Notifications
    $notifications = [
        [
            'id' => 'notif-1',
            'customer_id' => $userId,
            'title' => 'Order On The Way! 🛵',
            'message' => 'Rider Ramon is zooming towards your address with order #TRK-89234.',
            'type' => 'order',
            'is_read' => 0
        ],
        [
            'id' => 'notif-2',
            'customer_id' => $userId,
            'title' => 'Welcome to Trakz Delivery! 🎉',
            'message' => 'Enjoy 20% off your first order using promo code TRAKZWELCOME.',
            'type' => 'promo',
            'is_read' => 1
        ],
        [
            'id' => 'notif-3',
            'customer_id' => $userId,
            'title' => 'Order Delivered ✅',
            'message' => 'Order #TRK-84102 from Bella Napoli was delivered. Enjoy your food!',
            'type' => 'order',
            'is_read' => 1
        ]
    ];

    $stmtNPrep = $pdo->prepare("REPLACE INTO notifications (id, customer_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($notifications as $n) {
        $stmtNPrep->execute([$n['id'], $n['customer_id'], $n['title'], $n['message'], $n['type'], $n['is_read']]);
    }

    // 6. Seed Orders
    $orders = [
        [
            'id' => 'TRK-89234',
            'customer_id' => $userId,
            'merchant_id' => 'merch-1',
            'merchant_name' => 'Burger Craft & Grills',
            'merchant_logo' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
            'merchant_phone' => '+63 918 888 7777',
            'order_status' => 'On the Way',
            'payment_method' => 'GCash',
            'payment_status' => 'Paid',
            'items' => json_encode([
                [
                    'id' => 'prod-101',
                    'name' => 'Trakz Supreme Double Smash Burger',
                    'quantity' => 2,
                    'price' => 289,
                    'variantName' => 'Double Patty (Standard)',
                    'selectedAddOns' => [
                        ['id' => 'a1', 'name' => 'Extra Crispy Bacon', 'price' => 45]
                    ],
                    'itemTotal' => 668
                ],
                [
                    'id' => 'prod-103',
                    'name' => 'Loaded Cajun Cheese Fries',
                    'quantity' => 1,
                    'price' => 145,
                    'variantName' => 'Regular Size',
                    'selectedAddOns' => [],
                    'itemTotal' => 145
                ]
            ]),
            'subtotal' => 813.00,
            'delivery_fee' => 49.00,
            'discount' => 100.00,
            'tax_and_fees' => 20.00,
            'total' => 782.00,
            'delivery_address' => json_encode([
                'label' => 'Home',
                'street' => 'Unit 12B Tower 2, Horizon Condominiums',
                'barangay' => 'Barangay San Lorenzo',
                'city' => 'Makati City',
                'postalCode' => '1223',
                'deliveryInstructions' => 'Call upon arrival.'
            ]),
            'delivery_instructions' => 'Call upon arrival.',
            'rider' => json_encode([
                'name' => 'Ramon Dela Cruz',
                'phone' => '+63 919 555 1234',
                'rating' => 4.9,
                'vehicle' => 'Red Honda Click 125i',
                'plateNumber' => 'NKR 8821',
                'photo' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                'currentLocation' => ['lat' => 14.5525, 'lng' => 121.0210]
            ]),
            'estimated_delivery_time' => '12-18 mins'
        ],
        [
            'id' => 'TRK-84102',
            'customer_id' => $userId,
            'merchant_id' => 'merch-2',
            'merchant_name' => 'Bella Napoli Woodfired Pizza',
            'merchant_logo' => 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=200&q=80',
            'merchant_phone' => '+63 918 999 4444',
            'order_status' => 'Delivered',
            'payment_method' => 'Cash on Delivery',
            'payment_status' => 'Paid',
            'items' => json_encode([
                [
                    'id' => 'prod-201',
                    'name' => 'Truffle Prosciutto Speciale Pizza 12"',
                    'quantity' => 1,
                    'price' => 495,
                    'variantName' => '12-inch Personal (8 slices)',
                    'selectedAddOns' => [
                        ['id' => 'a3', 'name' => 'Garlic Butter Crust Dip', 'price' => 25]
                    ],
                    'itemTotal' => 520
                ]
            ]),
            'subtotal' => 520.00,
            'delivery_fee' => 39.00,
            'discount' => 0.00,
            'tax_and_fees' => 15.00,
            'total' => 574.00,
            'delivery_address' => json_encode([
                'label' => 'Office',
                'street' => 'Floor 15, Tech Tower Plaza, Ayala Ave',
                'barangay' => 'Barangay Bel-Air',
                'city' => 'Makati City',
                'postalCode' => '1209'
            ]),
            'delivery_instructions' => null,
            'rider' => json_encode([
                'name' => 'Marco Santos',
                'phone' => '+63 917 888 2211',
                'rating' => 4.8,
                'vehicle' => 'Yamaha NMAX Black',
                'plateNumber' => 'ND 9420'
            ]),
            'estimated_delivery_time' => '20-30 mins'
        ]
    ];

    $stmtOPrep = $pdo->prepare("REPLACE INTO orders (id, customer_id, merchant_id, merchant_name, merchant_logo, merchant_phone, order_status, payment_method, payment_status, items, subtotal, delivery_fee, discount, tax_and_fees, total, delivery_address, delivery_instructions, rider, estimated_delivery_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    foreach ($orders as $o) {
        $stmtOPrep->execute([
            $o['id'], $o['customer_id'], $o['merchant_id'], $o['merchant_name'],
            $o['merchant_logo'], $o['merchant_phone'], $o['order_status'], $o['payment_method'],
            $o['payment_status'], $o['items'], $o['subtotal'], $o['delivery_fee'],
            $o['discount'], $o['tax_and_fees'], $o['total'], $o['delivery_address'],
            $o['delivery_instructions'], $o['rider'], $o['estimated_delivery_time']
        ]);
    }
}
