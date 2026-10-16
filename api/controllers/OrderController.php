<?php
// Trakz PHP Backend - Order Controller

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';

class OrderController {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    public function placeOrder() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['items']) || empty($data['items'])) {
            Response::error('Invalid order payload.');
        }

        $orderId = 'TRK-' . rand(10000, 99999);
        $customerId = $data['customerId'] ?? 'cust-101';
        $customerName = $data['customerName'] ?? 'Default User';
        $merchantId = $data['merchant']['id'] ?? $data['merchantId'] ?? 'merch-1';
        $merchantName = $data['merchant']['name'] ?? $data['merchantName'] ?? 'Trakz Merchant';
        $merchantLogo = $data['merchant']['logo'] ?? $data['merchantLogo'] ?? '';
        $merchantPhone = '+63 918 888 7777';
        $orderStatus = 'Pending';
        $paymentMethod = $data['paymentMethod'] ?? 'GCash';
        $paymentStatus = ($paymentMethod === 'Cash on Delivery') ? 'Unpaid' : 'Paid';

        $itemsJson = json_encode($data['items']);
        $subtotal = floatval($data['subtotal'] ?? 0);
        $deliveryFee = floatval($data['deliveryFee'] ?? 0);
        $discount = floatval($data['discount'] ?? 0);
        $taxAndFees = floatval($data['taxAndFees'] ?? 15);
        $total = floatval($data['total'] ?? ($subtotal + $deliveryFee + $taxAndFees - $discount));

        $deliveryAddress = $data['deliveryAddress'] ?? [];
        if (!empty($customerName) && is_array($deliveryAddress)) {
            $deliveryAddress['recipientName'] = $customerName;
        }
        $deliveryAddressJson = json_encode($deliveryAddress);
        $deliveryInstructions = $data['deliveryInstructions'] ?? '';

        $riderObj = null;
        $riderJson = null;

        try {
            $stmt = $this->pdo->prepare("INSERT INTO orders (id, customer_id, merchant_id, merchant_name, merchant_logo, merchant_phone, order_status, payment_method, payment_status, items, subtotal, delivery_fee, discount, tax_and_fees, total, delivery_address, delivery_instructions, rider) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $stmt->execute([
                $orderId, $customerId, $merchantId, $merchantName, $merchantLogo, $merchantPhone,
                $orderStatus, $paymentMethod, $paymentStatus, $itemsJson, $subtotal, $deliveryFee,
                $discount, $taxAndFees, $total, $deliveryAddressJson, $deliveryInstructions, $riderJson
            ]);
        } catch (PDOException $e) {
            try {
                $this->pdo->exec("ALTER TABLE orders MODIFY merchant_logo LONGTEXT");
                $stmt = $this->pdo->prepare("INSERT INTO orders (id, customer_id, merchant_id, merchant_name, merchant_logo, merchant_phone, order_status, payment_method, payment_status, items, subtotal, delivery_fee, discount, tax_and_fees, total, delivery_address, delivery_instructions, rider) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $orderId, $customerId, $merchantId, $merchantName, $merchantLogo, $merchantPhone,
                    $orderStatus, $paymentMethod, $paymentStatus, $itemsJson, $subtotal, $deliveryFee,
                    $discount, $taxAndFees, $total, $deliveryAddressJson, $deliveryInstructions, $riderJson
                ]);
            } catch (Exception $ex) {
                if (strlen($merchantLogo) > 250 && strpos($merchantLogo, 'data:') === 0) {
                    $merchantLogo = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80';
                }
                $stmt = $this->pdo->prepare("INSERT INTO orders (id, customer_id, merchant_id, merchant_name, merchant_logo, merchant_phone, order_status, payment_method, payment_status, items, subtotal, delivery_fee, discount, tax_and_fees, total, delivery_address, delivery_instructions, rider) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $orderId, $customerId, $merchantId, $merchantName, $merchantLogo, $merchantPhone,
                    $orderStatus, $paymentMethod, $paymentStatus, $itemsJson, $subtotal, $deliveryFee,
                    $discount, $taxAndFees, $total, $deliveryAddressJson, $deliveryInstructions, $riderJson
                ]);
            }
        }

        // Add Notification
        $this->pdo->prepare("INSERT INTO notifications (id, customer_id, title, message, type) VALUES (?, ?, ?, ?, ?)")
            ->execute([
                'notif-' . time(), $customerId, "Order #{$orderId} Placed!", "Your order with {$merchantName} has been received.", "order"
            ]);

        $newOrder = [
            'id' => $orderId,
            'customerId' => $customerId,
            'customerName' => $customerName,
            'merchantId' => $merchantId,
            'merchantName' => $merchantName,
            'merchantLogo' => $merchantLogo,
            'merchantPhone' => $merchantPhone,
            'orderStatus' => $orderStatus,
            'paymentMethod' => $paymentMethod,
            'paymentStatus' => $paymentStatus,
            'items' => $data['items'],
            'subtotal' => $subtotal,
            'deliveryFee' => $deliveryFee,
            'discount' => $discount,
            'taxAndFees' => $taxAndFees,
            'total' => $total,
            'deliveryAddress' => $deliveryAddress,
            'deliveryInstructions' => $deliveryInstructions,
            'rider' => $riderObj,
            'createdAt' => date('Y-m-d\TH:i:s\Z'),
            'estimatedDeliveryTime' => '20-30 mins'
        ];

        Response::json(['success' => true, 'order' => $newOrder], 201);
    }

    public function getOrders() {
        $stmt = $this->pdo->query("SELECT orders.*, users.full_name AS user_full_name FROM orders LEFT JOIN users ON orders.customer_id = users.id ORDER BY orders.created_at DESC");
        $rows = $stmt->fetchAll();

        $orders = array_map(function($r) {
            $addr = json_decode($r['delivery_address'] ?: '{}', true);
            $cName = $r['user_full_name'] ?? ($addr['recipientName'] ?? 'Default User');
            if (!$cName || $cName === 'Default User') {
                $cName = 'Default User';
            }

            return [
                'id' => $r['id'],
                'customerId' => $r['customer_id'],
                'customerName' => $cName,
                'merchantId' => $r['merchant_id'],
                'merchantName' => $r['merchant_name'],
                'merchantLogo' => $r['merchant_logo'],
                'merchantPhone' => $r['merchant_phone'],
                'orderStatus' => $r['order_status'],
                'paymentMethod' => $r['payment_method'],
                'paymentStatus' => $r['payment_status'],
                'items' => json_decode($r['items'] ?: '[]', true),
                'subtotal' => (float)$r['subtotal'],
                'deliveryFee' => (float)$r['delivery_fee'],
                'discount' => (float)$r['discount'],
                'taxAndFees' => (float)$r['tax_and_fees'],
                'total' => (float)$r['total'],
                'deliveryAddress' => $addr,
                'deliveryInstructions' => $r['delivery_instructions'],
                'rider' => json_decode($r['rider'] ?: '{}', true),
                'createdAt' => $r['created_at'],
                'estimatedDeliveryTime' => $r['estimated_delivery_time'] ?: '20-30 mins'
            ];
        }, $rows);

        Response::json($orders);
    }

    public function getOrderById($id) {
        $stmt = $this->pdo->prepare("SELECT orders.*, users.full_name AS user_full_name FROM orders LEFT JOIN users ON orders.customer_id = users.id WHERE orders.id = ?");
        $stmt->execute([$id]);
        $r = $stmt->fetch();

        if (!$r) {
            Response::error("Order #{$id} not found.", 404);
        }

        $addr = json_decode($r['delivery_address'] ?: '{}', true);
        $cName = $r['user_full_name'] ?? ($addr['recipientName'] ?? 'Default User');

        Response::json([
            'id' => $r['id'],
            'customerId' => $r['customer_id'],
            'customerName' => $cName,
            'merchantId' => $r['merchant_id'],
            'merchantName' => $r['merchant_name'],
            'merchantLogo' => $r['merchant_logo'],
            'merchantPhone' => $r['merchant_phone'],
            'orderStatus' => $r['order_status'],
            'paymentMethod' => $r['payment_method'],
            'paymentStatus' => $r['payment_status'],
            'items' => json_decode($r['items'] ?: '[]', true),
            'subtotal' => (float)$r['subtotal'],
            'deliveryFee' => (float)$r['delivery_fee'],
            'discount' => (float)$r['discount'],
            'taxAndFees' => (float)$r['tax_and_fees'],
            'total' => (float)$r['total'],
            'deliveryAddress' => $addr,
            'deliveryInstructions' => $r['delivery_instructions'],
            'rider' => json_decode($r['rider'] ?: '{}', true),
            'createdAt' => $r['created_at'],
            'estimatedDeliveryTime' => $r['estimated_delivery_time'] ?: '20-30 mins'
        ]);
    }

    public function updateOrderStatus($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $nextStatus = $data['orderStatus'] ?? $data['status'] ?? null;

        if (!$nextStatus) {
            Response::error('Status required.');
        }

        $stmt = $this->pdo->prepare("UPDATE orders SET order_status = ? WHERE id = ?");
        $stmt->execute([$nextStatus, $id]);

        return $this->getOrderById($id);
    }
}
