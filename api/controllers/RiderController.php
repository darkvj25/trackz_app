<?php
// Trakz PHP Backend - Rider Controller

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';

class RiderController {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    /**
     * Get available dispatch orders waiting for rider pick up
     */
    public function getAvailableOrders() {
        $stmt = $this->pdo->query("SELECT * FROM orders WHERE order_status IN ('Pending', 'Preparing', 'Ready for Rider') ORDER BY created_at DESC");
        $rows = $stmt ? $stmt->fetchAll() : [];

        $orders = array_map(function($r) {
            $addr = json_decode($r['delivery_address'] ?: '{}', true);
            return [
                'id' => $r['id'],
                'customerId' => $r['customer_id'],
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

    /**
     * Get orders assigned to specific rider or all rider active trips
     */
    public function getRiderOrders($riderId = null) {
        $sql = "SELECT * FROM orders ORDER BY created_at DESC";
        $stmt = $this->pdo->query($sql);
        $rows = $stmt ? $stmt->fetchAll() : [];

        $orders = array_map(function($r) {
            $addr = json_decode($r['delivery_address'] ?: '{}', true);
            return [
                'id' => $r['id'],
                'customerId' => $r['customer_id'],
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

    /**
     * Claim / Accept an order delivery
     */
    public function acceptOrder($orderId) {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $riderInfo = $data['rider'] ?? [
            'name' => $data['riderName'] ?? 'Marco Santos',
            'phone' => '+63 919 444 8888',
            'rating' => 4.9,
            'vehicle' => 'Honda Click 150i',
            'plateNumber' => 'NKR 9102',
            'photo' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            'currentLocation' => ['lat' => 14.5530, 'lng' => 121.0220]
        ];

        $riderJson = json_encode($riderInfo);
        $nextStatus = 'Rider Assigned';

        $stmt = $this->pdo->prepare("UPDATE orders SET order_status = ?, rider = ? WHERE id = ?");
        $stmt->execute([$nextStatus, $riderJson, $orderId]);

        // Add Notification
        $this->pdo->prepare("INSERT INTO notifications (id, customer_id, title, message, type) VALUES (?, 'cust-101', ?, ?, 'order')")
            ->execute([
                'notif-' . time(),
                "Rider Assigned! 🛵",
                "Rider {$riderInfo['name']} has accepted your order #{$orderId}."
            ]);

        Response::json([
            'success' => true,
            'message' => "Order #{$orderId} claimed successfully by rider.",
            'orderId' => $orderId,
            'orderStatus' => $nextStatus,
            'rider' => $riderInfo
        ]);
    }

    /**
     * Update order delivery progress status
     */
    public function updateOrderStatus($orderId) {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $nextStatus = $data['orderStatus'] ?? $data['status'] ?? 'On the Way';

        $stmt = $this->pdo->prepare("UPDATE orders SET order_status = ? WHERE id = ?");
        $stmt->execute([$nextStatus, $orderId]);

        // If delivered, set payment_status to Paid if COD
        if ($nextStatus === 'Delivered') {
            $this->pdo->prepare("UPDATE orders SET payment_status = 'Paid' WHERE id = ?")->execute([$orderId]);
        }

        Response::json([
            'success' => true,
            'message' => "Order #{$orderId} status set to '{$nextStatus}'.",
            'orderId' => $orderId,
            'orderStatus' => $nextStatus
        ]);
    }

    /**
     * Get rider dashboard telemetry stats
     */
    public function getStats() {
        $stmtDelivered = $this->pdo->query("SELECT COUNT(*) as count, SUM(delivery_fee) as total_fees FROM orders WHERE order_status = 'Delivered'");
        $deliveredRow = $stmtDelivered ? $stmtDelivered->fetch() : ['count' => 0, 'total_fees' => 0];

        $stmtActive = $this->pdo->query("SELECT COUNT(*) as count FROM orders WHERE order_status IN ('Rider Assigned', 'On the Way', 'Preparing')");
        $activeRow = $stmtActive ? $stmtActive->fetch() : ['count' => 0];

        $totalCount = intval($deliveredRow['count'] ?? 0);
        $totalFees = floatval($deliveredRow['total_fees'] ?? 0);
        $tips = $totalCount * 25; // average tips calculation

        Response::json([
            'todayEarnings' => $totalFees + $tips,
            'deliveryFees' => $totalFees,
            'tips' => $tips,
            'completedDeliveries' => $totalCount,
            'activeTripCount' => intval($activeRow['count'] ?? 0),
            'rating' => 4.9,
            'acceptanceRate' => 98
        ]);
    }
}
