<?php
// Trakz PHP Backend - Database Configuration & PDO Singleton

class Database {
    private static $instance = null;
    private static $schemaInitialized = false;
    private $pdo;

    private function __construct() {
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $port = getenv('DB_PORT') ?: '3306';
        $dbName = getenv('DB_NAME') ?: 'trackz_db';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASS') ?: '';

        $pdoOptions = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];

        // Enable SSL/TLS for cloud database connections like TiDB
        if ($port == '4000' || strpos($host, 'tidbcloud.com') !== false || getenv('DB_SSL') === 'true') {
            $pdoOptions[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
        }

        try {
            // First attempt connecting directly with database name in DSN (required for hosted MySQL like InfinityFree / TiDB)
            try {
                $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
                $this->pdo = new PDO($dsn, $user, $pass, $pdoOptions);
            } catch (PDOException $e) {
                // If direct db connection failed, try connecting to server root & creating database (local Laragon/XAMPP)
                $dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
                $pdo = new PDO($dsn, $user, $pass, $pdoOptions);
                $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                $pdo->exec("USE `{$dbName}`;");
                $this->pdo = $pdo;
            }

        } catch (PDOException $e) {
            // Fallback to SQLite file database if MySQL is unavailable
            $sqlitePath = __DIR__ . '/../db/trackz_fallback.sqlite';
            $dir = dirname($sqlitePath);
            if (!file_exists($dir)) {
                mkdir($dir, 0777, true);
            }
            $this->pdo = new PDO("sqlite:" . $sqlitePath, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        }

        $this->initializeSchema();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance->pdo;
    }

    private function initializeSchema() {
        if (self::$schemaInitialized) {
            return;
        }

        // Fast check: if tables and registration_fee exist, skip schema setup
        try {
            $check = $this->pdo->query("SELECT registration_fee FROM merchants LIMIT 1");
            if ($check !== false) {
                self::$schemaInitialized = true;
                return;
            }
        } catch (Exception $e) {
            // Needs schema creation or column alteration
        }

        $driver = $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

        if ($driver === 'sqlite') {
            $this->pdo->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    full_name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    phone TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'customer',
                    status TEXT DEFAULT 'active',
                    avatar TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS merchants (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    logo TEXT,
                    cover_image TEXT,
                    category TEXT NOT NULL,
                    category_name TEXT NOT NULL,
                    is_open INTEGER DEFAULT 1,
                    rating REAL DEFAULT 5.0,
                    review_count INTEGER DEFAULT 0,
                    delivery_fee REAL DEFAULT 0,
                    promo_badge TEXT,
                    estimated_delivery_time TEXT,
                    distance_km TEXT,
                    price_range TEXT,
                    min_order_amount REAL,
                    is_featured INTEGER DEFAULT 0,
                    is_popular INTEGER DEFAULT 0,
                    brand_color TEXT,
                    brand_letter TEXT,
                    registration_fee REAL DEFAULT 999.00,
                    is_registration_paid INTEGER DEFAULT 1,
                    membership_expires_at TEXT,
                    tags TEXT,
                    menu_categories TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    merchant_id TEXT NOT NULL,
                    merchant_name TEXT NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    price REAL NOT NULL,
                    image TEXT,
                    category TEXT NOT NULL,
                    rating REAL DEFAULT 4.8,
                    is_popular INTEGER DEFAULT 0,
                    variants TEXT,
                    add_ons TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS addresses (
                    id TEXT PRIMARY KEY,
                    customer_id TEXT NOT NULL,
                    label TEXT NOT NULL,
                    street TEXT NOT NULL,
                    barangay TEXT NOT NULL,
                    city TEXT NOT NULL,
                    postal_code TEXT DEFAULT '1000',
                    delivery_instructions TEXT,
                    is_default INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS orders (
                    id TEXT PRIMARY KEY,
                    customer_id TEXT NOT NULL,
                    merchant_id TEXT NOT NULL,
                    merchant_name TEXT NOT NULL,
                    merchant_logo TEXT,
                    merchant_phone TEXT,
                    order_status TEXT DEFAULT 'Pending',
                    payment_method TEXT NOT NULL,
                    payment_status TEXT DEFAULT 'Paid',
                    items TEXT NOT NULL,
                    subtotal REAL NOT NULL,
                    delivery_fee REAL NOT NULL,
                    discount REAL DEFAULT 0,
                    tax_and_fees REAL DEFAULT 15,
                    total REAL NOT NULL,
                    delivery_address TEXT NOT NULL,
                    delivery_instructions TEXT,
                    rider TEXT,
                    estimated_delivery_time TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS notifications (
                    id TEXT PRIMARY KEY,
                    customer_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    type TEXT DEFAULT 'order',
                    is_read INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ");
        } else {
            // MySQL Schema Execution
            $this->pdo->exec("
                CREATE TABLE IF NOT EXISTS `users` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `full_name` VARCHAR(100) NOT NULL,
                  `email` VARCHAR(100) NOT NULL UNIQUE,
                  `phone` VARCHAR(20) NOT NULL,
                  `password_hash` VARCHAR(255) NOT NULL,
                  `role` VARCHAR(20) DEFAULT 'customer',
                  `status` VARCHAR(50) DEFAULT 'active',
                  `avatar` LONGTEXT DEFAULT NULL,
                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS `merchants` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `name` VARCHAR(100) NOT NULL,
                  `description` TEXT,
                  `logo` LONGTEXT,
                  `cover_image` LONGTEXT,
                  `category` VARCHAR(50) NOT NULL,
                  `category_name` VARCHAR(100) NOT NULL,
                  `is_open` TINYINT(1) DEFAULT 1,
                  `rating` DECIMAL(3,2) DEFAULT 5.00,
                  `review_count` INT DEFAULT 0,
                  `delivery_fee` DECIMAL(10,2) DEFAULT 0.00,
                  `promo_badge` VARCHAR(100) DEFAULT NULL,
                  `estimated_delivery_time` VARCHAR(50) DEFAULT '20-30 min',
                  `distance_km` VARCHAR(20) DEFAULT '1.0 km',
                  `price_range` VARCHAR(10) DEFAULT '$$',
                  `min_order_amount` DECIMAL(10,2) DEFAULT 100.00,
                  `is_featured` TINYINT(1) DEFAULT 0,
                  `is_popular` TINYINT(1) DEFAULT 0,
                  `brand_color` VARCHAR(100) DEFAULT NULL,
                  `brand_letter` VARCHAR(10) DEFAULT NULL,
                  `registration_fee` DECIMAL(10,2) DEFAULT 999.00,
                  `is_registration_paid` TINYINT(1) DEFAULT 1,
                  `membership_expires_at` DATETIME DEFAULT NULL,
                  `tags` TEXT,
                  `menu_categories` TEXT,
                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS `products` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `merchant_id` VARCHAR(64) NOT NULL,
                  `merchant_name` VARCHAR(100) NOT NULL,
                  `name` VARCHAR(150) NOT NULL,
                  `description` TEXT,
                  `price` DECIMAL(10,2) NOT NULL,
                  `image` LONGTEXT,
                  `category` VARCHAR(100) NOT NULL,
                  `rating` DECIMAL(3,2) DEFAULT 4.80,
                  `is_popular` TINYINT(1) DEFAULT 0,
                  `variants` TEXT,
                  `add_ons` TEXT,
                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS `addresses` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `customer_id` VARCHAR(64) NOT NULL,
                  `label` VARCHAR(50) NOT NULL,
                  `street` VARCHAR(255) NOT NULL,
                  `barangay` VARCHAR(100) NOT NULL,
                  `city` VARCHAR(100) NOT NULL,
                  `postal_code` VARCHAR(20) DEFAULT '1000',
                  `delivery_instructions` TEXT DEFAULT NULL,
                  `is_default` TINYINT(1) DEFAULT 0,
                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS `orders` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `customer_id` VARCHAR(64) NOT NULL,
                  `merchant_id` VARCHAR(64) NOT NULL,
                  `merchant_name` VARCHAR(100) NOT NULL,
                  `merchant_logo` LONGTEXT DEFAULT NULL,
                  `merchant_phone` VARCHAR(20) DEFAULT '+63 918 888 7777',
                  `order_status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
                  `payment_method` VARCHAR(50) NOT NULL,
                  `payment_status` VARCHAR(20) NOT NULL DEFAULT 'Paid',
                  `items` LONGTEXT NOT NULL,
                  `subtotal` DECIMAL(10,2) NOT NULL,
                  `delivery_fee` DECIMAL(10,2) NOT NULL,
                  `discount` DECIMAL(10,2) DEFAULT 0.00,
                  `tax_and_fees` DECIMAL(10,2) DEFAULT 15.00,
                  `total` DECIMAL(10,2) NOT NULL,
                  `delivery_address` TEXT NOT NULL,
                  `delivery_instructions` TEXT DEFAULT NULL,
                  `rider` TEXT DEFAULT NULL,
                  `estimated_delivery_time` VARCHAR(50) DEFAULT '20-30 mins',
                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS `notifications` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `customer_id` VARCHAR(64) NOT NULL,
                  `title` VARCHAR(150) NOT NULL,
                  `message` TEXT NOT NULL,
                  `type` VARCHAR(50) DEFAULT 'order',
                  `is_read` TINYINT(1) DEFAULT 0,
                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");

            try {
                $this->pdo->exec("ALTER TABLE `users` MODIFY `avatar` LONGTEXT;");
            } catch (Exception $e) {}

            try {
                $this->pdo->exec("ALTER TABLE `products` MODIFY `image` LONGTEXT;");
            } catch (Exception $e) {}

            try {
                $this->pdo->exec("ALTER TABLE `merchants` MODIFY `logo` LONGTEXT;");
            } catch (Exception $e) {}

            try {
                $this->pdo->exec("ALTER TABLE `merchants` MODIFY `cover_image` LONGTEXT;");
            } catch (Exception $e) {}

            try {
                $this->pdo->exec("ALTER TABLE `orders` MODIFY `merchant_logo` LONGTEXT;");
            } catch (Exception $e) {}

            try {
                $this->pdo->exec("ALTER TABLE `users` ADD COLUMN `role` VARCHAR(20) DEFAULT 'customer';");
            } catch (Exception $e) {}

            try {
                $this->pdo->exec("ALTER TABLE `users` ADD COLUMN `status` VARCHAR(50) DEFAULT 'active';");
            } catch (Exception $e) {}

            try {
                $this->pdo->exec("ALTER TABLE `merchants` ADD COLUMN `registration_fee` DECIMAL(10,2) DEFAULT 999.00;");
            } catch (Exception $e) {}

            try {
                $this->pdo->exec("ALTER TABLE `merchants` ADD COLUMN `is_registration_paid` TINYINT(1) DEFAULT 1;");
            } catch (Exception $e) {}

            try {
                $this->pdo->exec("ALTER TABLE `merchants` ADD COLUMN `membership_expires_at` DATETIME DEFAULT NULL;");
            } catch (Exception $e) {}
        }

        self::$schemaInitialized = true;
    }
}
