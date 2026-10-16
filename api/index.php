<?php
// Trakz PHP REST API - Main Entry Point & Router

require_once __DIR__ . '/helpers/Response.php';

// Enable CORS immediately for all incoming requests and OPTIONS preflights
Response::enableCORS();

require_once __DIR__ . '/seed.php';

require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/MerchantController.php';
require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/controllers/OrderController.php';
require_once __DIR__ . '/controllers/AddressController.php';
require_once __DIR__ . '/controllers/NotificationController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/controllers/RiderController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Normalize path: strip script directory if present
$baseDir = dirname($_SERVER['SCRIPT_NAME']);
if ($baseDir !== '/' && strpos($uri, $baseDir) === 0) {
    $uri = substr($uri, strlen($baseDir));
}
$uri = '/' . ltrim($uri, '/');

// Strip /index.php if present in URL
if (strpos($uri, '/index.php') === 0) {
    $uri = substr($uri, strlen('/index.php'));
}
$uri = '/' . ltrim($uri, '/');

// Strip /v1 if present in URL
if (strpos($uri, '/v1') === 0) {
    $uri = substr($uri, 3);
}
$uri = '/' . ltrim($uri, '/');

// Strip trailing slash except for root '/'
if (strlen($uri) > 1 && substr($uri, -1) === '/') {
    $uri = rtrim($uri, '/');
}

// Router Rules
try {
    // AUTH & ADMIN
    if ($uri === '/auth/login' && $method === 'POST') {
        (new AuthController())->login();
    } elseif ($uri === '/auth/register' && $method === 'POST') {
        (new AuthController())->register();
    } elseif ($uri === '/auth/forgot-password' && $method === 'POST') {
        (new AuthController())->forgotPassword();
    } elseif ($uri === '/auth/profile' && $method === 'PUT') {
        (new AuthController())->updateProfile();
    } elseif ($uri === '/admin/stats' && $method === 'GET') {
        (new AdminController())->getStats();
    } elseif ($uri === '/admin/riders' && $method === 'GET') {
        (new AdminController())->getRiders();
    } elseif (preg_match('#^/admin/riders/([^/]+)/approve$#', $uri, $matches) && ($method === 'POST' || $method === 'PUT')) {
        (new AdminController())->approveRider($matches[1]);
    } elseif ($uri === '/admin/users' && $method === 'GET') {
        (new AdminController())->getUsers();
    } elseif ($uri === '/admin/settings' && $method === 'GET') {
        (new AdminController())->getSettings();
    } elseif ($uri === '/admin/settings' && ($method === 'PUT' || $method === 'POST')) {
        (new AdminController())->updateSettings();
    }

    // MERCHANTS
    elseif ($uri === '/merchants' && $method === 'GET') {
        (new MerchantController())->getMerchants();
    } elseif ($uri === '/merchants' && $method === 'POST') {
        (new MerchantController())->createMerchant();
    } elseif (preg_match('#^/merchants/([^/]+)/toggle$#', $uri, $matches) && ($method === 'POST' || $method === 'PUT' || $method === 'PATCH')) {
        (new MerchantController())->toggleStatus($matches[1]);
    } elseif (preg_match('#^/merchants/([^/]+)/products$#', $uri, $matches) && $method === 'GET') {
        (new ProductController())->getProductsByMerchant($matches[1]);
    } elseif (preg_match('#^/merchants/([^/]+)$#', $uri, $matches) && ($method === 'PUT' || $method === 'PATCH')) {
        (new MerchantController())->updateMerchant($matches[1]);
    } elseif (preg_match('#^/merchants/([^/]+)$#', $uri, $matches) && $method === 'GET') {
        (new MerchantController())->getMerchantById($matches[1]);
    }

    // PRODUCTS
    elseif ($uri === '/products' && $method === 'POST') {
        (new ProductController())->createProduct();
    } elseif (preg_match('#^/products/([^/]+)$#', $uri, $matches) && ($method === 'PUT' || $method === 'PATCH')) {
        (new ProductController())->updateProduct($matches[1]);
    } elseif (preg_match('#^/products/([^/]+)$#', $uri, $matches) && $method === 'DELETE') {
        (new ProductController())->deleteProduct($matches[1]);
    } elseif ($uri === '/products/popular' && $method === 'GET') {
        (new ProductController())->getPopularProducts();
    } elseif ($uri === '/products/search' && $method === 'GET') {
        (new ProductController())->searchProducts();
    }

    // ORDERS
    elseif ($uri === '/orders' && $method === 'GET') {
        (new OrderController())->getOrders();
    } elseif ($uri === '/orders' && $method === 'POST') {
        (new OrderController())->placeOrder();
    } elseif (preg_match('#^/orders/([^/]+)/status$#', $uri, $matches) && ($method === 'PATCH' || $method === 'PUT' || $method === 'POST')) {
        (new OrderController())->updateOrderStatus($matches[1]);
    } elseif (preg_match('#^/orders/([^/]+)$#', $uri, $matches) && $method === 'GET') {
        (new OrderController())->getOrderById($matches[1]);
    }

    // CART
    elseif ($uri === '/cart/validate' && $method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $items = $data['items'] ?? [];
        $subtotal = 0;
        foreach ($items as $it) {
            $price = floatval($it['price'] ?? 0);
            $qty = intval($it['quantity'] ?? 1);
            $subtotal += $price * $qty;
        }
        $deliveryFee = floatval($data['merchant']['deliveryFee'] ?? 49);
        $discount = floatval($data['voucher']['discountAmount'] ?? 0);
        $total = max(0, $subtotal + $deliveryFee - $discount);
        Response::json([
            'isValid' => true,
            'merchantId' => $data['merchant']['id'] ?? null,
            'subtotal' => $subtotal,
            'deliveryFee' => $deliveryFee,
            'discount' => $discount,
            'total' => $total
        ]);
    }

    // PAYMENT
    elseif ($uri === '/payment/methods' && $method === 'GET') {
        Response::json([
            ['id' => 'gcash', 'name' => 'GCash', 'type' => 'e-wallet', 'isPopular' => true],
            ['id' => 'maya', 'name' => 'Maya', 'type' => 'e-wallet', 'isPopular' => false],
            ['id' => 'cod', 'name' => 'Cash on Delivery', 'type' => 'cash', 'isPopular' => true],
            ['id' => 'card', 'name' => 'Credit / Debit Card', 'type' => 'card', 'isPopular' => false]
        ]);
    } elseif ($uri === '/payment/verify' && $method === 'POST') {
        Response::json([
            'status' => 'SUCCESS',
            'transactionId' => 'TXN-' . time() . '-' . rand(1000, 9999)
        ]);
    }

    // ADDRESSES
    elseif ($uri === '/addresses' && $method === 'GET') {
        (new AddressController())->getAddresses();
    } elseif ($uri === '/addresses' && $method === 'POST') {
        (new AddressController())->addAddress();
    } elseif (preg_match('#^/addresses/([^/]+)/default$#', $uri, $matches) && ($method === 'PUT' || $method === 'POST')) {
        (new AddressController())->setDefaultAddress($matches[1]);
    } elseif (preg_match('#^/addresses/([^/]+)$#', $uri, $matches) && $method === 'DELETE') {
        (new AddressController())->deleteAddress($matches[1]);
    }

    // NOTIFICATIONS
    elseif ($uri === '/notifications' && $method === 'GET') {
        (new NotificationController())->getNotifications();
    } elseif ($uri === '/notifications/read-all' && ($method === 'PUT' || $method === 'POST')) {
        (new NotificationController())->markAllAsRead();
    } elseif (preg_match('#^/notifications/([^/]+)/read$#', $uri, $matches) && ($method === 'PUT' || $method === 'POST')) {
        (new NotificationController())->markAsRead($matches[1]);
    }

    // RIDER
    elseif ($uri === '/rider/available' && $method === 'GET') {
        (new RiderController())->getAvailableOrders();
    } elseif ($uri === '/rider/orders' && $method === 'GET') {
        (new RiderController())->getRiderOrders();
    } elseif (preg_match('#^/rider/orders/([^/]+)/accept$#', $uri, $matches) && ($method === 'POST' || $method === 'PUT')) {
        (new RiderController())->acceptOrder($matches[1]);
    } elseif (preg_match('#^/rider/orders/([^/]+)/status$#', $uri, $matches) && ($method === 'PATCH' || $method === 'PUT' || $method === 'POST')) {
        (new RiderController())->updateOrderStatus($matches[1]);
    } elseif ($uri === '/rider/stats' && $method === 'GET') {
        (new RiderController())->getStats();
    }

    // API Health check / ROOT / SEED / RESET
    elseif ($uri === '/' || $uri === '/index.php' || $uri === '/seed' || $uri === '/reset-database') {
        if ($uri === '/reset-database') {
            clearDatabase();
        } elseif ($uri === '/seed') {
            seedDatabase(true);
        }
        Response::json([
            'service' => 'Trakz Food Delivery PHP REST API',
            'version' => '1.0.0',
            'status' => 'online',
            'message' => $uri === '/reset-database' ? 'Database wiped clean.' : ($uri === '/seed' ? 'Database re-seeded.' : 'API operational.'),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        Response::error("Endpoint {$method} {$uri} not found.", 404);
    }
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}
