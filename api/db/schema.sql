-- Trakz Food & Product Delivery Database Schema
-- Compatible with MySQL / MariaDB

CREATE DATABASE IF NOT EXISTS `trackz_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `trackz_db`;

-- 1. Users Table
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

-- 2. Merchants Table
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
  `address` VARCHAR(255) DEFAULT 'Bonifacio High Street',
  `city` VARCHAR(100) DEFAULT 'Taguig City',
  `latitude` DECIMAL(10,8) DEFAULT 14.55150000,
  `longitude` DECIMAL(11,8) DEFAULT 121.05050000,
  `tags` TEXT, -- JSON array string
  `menu_categories` TEXT, -- JSON array string
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Products Table
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
  `variants` TEXT, -- JSON string
  `add_ons` TEXT, -- JSON string
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Addresses Table
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

-- 5. Orders Table
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
  `items` LONGTEXT NOT NULL, -- JSON array
  `subtotal` DECIMAL(10,2) NOT NULL,
  `delivery_fee` DECIMAL(10,2) NOT NULL,
  `discount` DECIMAL(10,2) DEFAULT 0.00,
  `tax_and_fees` DECIMAL(10,2) DEFAULT 15.00,
  `total` DECIMAL(10,2) NOT NULL,
  `delivery_address` TEXT NOT NULL, -- JSON object
  `delivery_instructions` TEXT DEFAULT NULL,
  `rider` TEXT DEFAULT NULL, -- JSON object
  `estimated_delivery_time` VARCHAR(50) DEFAULT '20-30 mins',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(64) PRIMARY KEY,
  `customer_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'order',
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
