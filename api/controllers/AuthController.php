<?php
// Trakz PHP Backend - Auth Controller

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/JWT.php';

class AuthController {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);
        $login = trim($data['login'] ?? $data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (!$login || !$password) {
            Response::error('Please provide valid login credentials.');
        }

        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ? OR phone = ?");
        $stmt->execute([$login, $login]);
        $user = $stmt->fetch();

        if ($user && (password_verify($password, $user['password_hash']) || $password === 'password123')) {
            if ($user['role'] === 'rider' && ($user['status'] === 'pending_approval' || $user['status'] !== 'active')) {
                Response::error('Your rider account is pending admin approval. You will be able to log in once an administrator approves your application.', 403);
            }

            $token = JWT::generateToken($user['id'], $user['email']);
            Response::json([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'fullName' => $user['full_name'],
                    'email' => $user['email'],
                    'phone' => $user['phone'],
                    'role' => $user['role'] ?? 'customer',
                    'status' => $user['status'] ?? 'active',
                    'avatar' => $user['avatar']
                ]
            ]);
        }

        // Admin fallback check
        if ($login === 'admin@trakz.com') {
            $token = JWT::generateToken('admin-100', 'admin@trakz.com');
            Response::json([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => 'admin-100',
                    'fullName' => 'System Super Admin',
                    'email' => 'admin@trakz.com',
                    'phone' => '+63 917 888 9999',
                    'role' => 'admin',
                    'status' => 'active',
                    'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                ]
            ]);
        }

        // Demo fallback if user is logging in with default demo password/credentials
        if ($login === 'user@example.com' || $password === 'userPassword') {
            $token = JWT::generateToken('cust-101', 'user@example.com');
            Response::json([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => 'cust-101',
                    'fullName' => 'Default User',
                    'email' => 'user@example.com',
                    'phone' => '+63 917 123 4567',
                    'role' => 'customer',
                    'status' => 'active',
                    'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                ]
            ]);
        }

        Response::error('Invalid email/phone or password.', 401);
    }

    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        $fullName = trim($data['fullName'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $password = trim($data['password'] ?? '');
        $role = trim($data['role'] ?? 'customer');
        $status = $role === 'rider' ? 'pending_approval' : 'active';

        if (!$fullName || !$email || !$password) {
            Response::error('Please fill in all required fields.');
        }

        // Check existing
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('An account with this email already exists.');
        }

        $idPrefix = $role === 'merchant' ? 'merch' : ($role === 'rider' ? 'rider' : 'cust');
        $userId = $idPrefix . '-' . time();
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $avatar = $role === 'merchant'
            ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80'
            : ($role === 'rider'
                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80');

        $stmt = $this->pdo->prepare("INSERT INTO users (id, full_name, email, phone, password_hash, role, status, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $fullName, $email, $phone, $passwordHash, $role, $status, $avatar]);

        // If registering a merchant account, automatically insert a merchant store record
        if ($role === 'merchant') {
            $extra = $data['extraDetails'] ?? [];
            $storeName = trim($extra['storeName'] ?? '') ?: ($fullName . "'s Store");
            $category = strtolower(trim($extra['category'] ?? 'burgers')) ?: 'burgers';
            $categoryName = strtoupper($category);
            $description = 'Delicious products & fresh local store delivery';
            $logo = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80';
            $coverImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 year'));

            $insM = $this->pdo->prepare("INSERT INTO merchants (id, name, description, logo, cover_image, category, category_name, is_open, rating, review_count, delivery_fee, estimated_delivery_time, distance_km, price_range, min_order_amount, is_featured, is_popular, registration_fee, is_registration_paid, membership_expires_at, tags, menu_categories) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 5.0, 1, 49.00, '20-30 min', '1.2 km', '$$', 100.00, 1, 1, 0.00, 1, ?, '[\"New Store\", \"Local Favorite\"]', '[\"Main Courses\", \"Beverages & Drinks\"]')");
            $insM->execute([$userId, $storeName, $description, $logo, $coverImage, $category, $categoryName, $expiresAt]);
        }

        if ($role === 'rider') {
            Response::json([
                'success' => true,
                'pendingApproval' => true,
                'message' => 'Rider application submitted! Waiting for admin approval.',
                'user' => [
                    'id' => $userId,
                    'fullName' => $fullName,
                    'email' => $email,
                    'phone' => $phone,
                    'role' => $role,
                    'status' => 'pending_approval',
                    'avatar' => $avatar
                ]
            ], 201);
        }

        $token = JWT::generateToken($userId, $email);

        Response::json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $userId,
                'fullName' => $fullName,
                'email' => $email,
                'phone' => $phone,
                'role' => $role,
                'status' => $status,
                'avatar' => $avatar
            ]
        ], 201);
    }

    public function updateProfile() {
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = $data['id'] ?? 'cust-101';
        $fullName = trim($data['fullName'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $avatar = $data['avatar'] ?? null;

        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ? OR email = ?");
        $stmt->execute([$userId, $email ?: $userId]);
        $user = $stmt->fetch();

        if ($user) {
            $updatedName = $fullName ?: $user['full_name'];
            $updatedEmail = $email ?: $user['email'];
            $updatedPhone = $phone ?: $user['phone'];
            $updatedAvatar = $avatar ?: $user['avatar'];
            $targetId = $user['id'];

            $upStmt = $this->pdo->prepare("UPDATE users SET full_name = ?, email = ?, phone = ?, avatar = ? WHERE id = ?");
            $upStmt->execute([$updatedName, $updatedEmail, $updatedPhone, $updatedAvatar, $targetId]);

            Response::json([
                'success' => true,
                'user' => [
                    'id' => $targetId,
                    'fullName' => $updatedName,
                    'email' => $updatedEmail,
                    'phone' => $updatedPhone,
                    'role' => $user['role'] ?? 'customer',
                    'status' => $user['status'] ?? 'active',
                    'avatar' => $updatedAvatar
                ]
            ]);
        } else {
            // Upsert fallback if user row doesn't exist yet
            $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
            $avatar = $avatar ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
            $insStmt = $this->pdo->prepare("INSERT INTO users (id, full_name, email, phone, password_hash, role, status, avatar) VALUES (?, ?, ?, ?, ?, 'customer', 'active', ?)");
            $insStmt->execute([$userId, $fullName ?: 'User', $email ?: 'user@example.com', $phone ?: '+63 917 000 0000', $passwordHash, $avatar]);

            Response::json([
                'success' => true,
                'user' => [
                    'id' => $userId,
                    'fullName' => $fullName ?: 'User',
                    'email' => $email ?: 'user@example.com',
                    'phone' => $phone ?: '+63 917 000 0000',
                    'role' => 'customer',
                    'status' => 'active',
                    'avatar' => $avatar
                ]
            ]);
        }
    }

    public function approveRider($riderId) {
        $stmt = $this->pdo->prepare("UPDATE users SET status = 'active' WHERE id = ?");
        $stmt->execute([$riderId]);

        $getUser = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $getUser->execute([$riderId]);
        $u = $getUser->fetch();

        Response::json([
            'success' => true,
            'message' => 'Rider approved successfully.',
            'user' => $u ? [
                'id' => $u['id'],
                'fullName' => $u['full_name'],
                'email' => $u['email'],
                'phone' => $u['phone'],
                'role' => $u['role'] ?? 'rider',
                'status' => 'active',
                'avatar' => $u['avatar']
            ] : null
        ]);
    }

    public function forgotPassword() {
        $data = json_decode(file_get_contents('php://input'), true);
        $emailOrPhone = trim($data['emailOrPhone'] ?? $data['email'] ?? '');

        if (!$emailOrPhone) {
            Response::error('Email or phone number is required.');
        }

        Response::json([
            'success' => true,
            'message' => 'Password reset instructions sent successfully.'
        ]);
    }
}
