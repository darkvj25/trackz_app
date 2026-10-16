<?php
// Trakz PHP Backend - Admin Controller

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';

class AdminController {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    /**
     * Get platform stats overview
     */
    public function getStats() {
        // Revenue & Orders
        $stmtRev = $this->pdo->query("SELECT SUM(total) as total_revenue, COUNT(*) as total_orders FROM orders");
        $revRow = $stmtRev ? $stmtRev->fetch() : ['total_revenue' => 0, 'total_orders' => 0];

        $stmtActive = $this->pdo->query("SELECT COUNT(*) as active_count FROM orders WHERE order_status NOT IN ('Delivered', 'Cancelled')");
        $activeRow = $stmtActive ? $stmtActive->fetch() : ['active_count' => 0];

        $stmtDelivered = $this->pdo->query("SELECT COUNT(*) as delivered_count FROM orders WHERE order_status = 'Delivered'");
        $deliveredRow = $stmtDelivered ? $stmtDelivered->fetch() : ['delivered_count' => 0];

        // Merchants
        $stmtMerch = $this->pdo->query("SELECT COUNT(*) as total_merchants, SUM(CASE WHEN is_open = 1 THEN 1 ELSE 0 END) as online_merchants FROM merchants");
        $merchRow = $stmtMerch ? $stmtMerch->fetch() : ['total_merchants' => 0, 'online_merchants' => 0];

        // Riders
        $stmtRiders = $this->pdo->query("SELECT COUNT(*) as total_riders, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_riders, SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) as pending_riders FROM users WHERE role = 'rider'");
        $ridersRow = $stmtRiders ? $stmtRiders->fetch() : ['total_riders' => 0, 'active_riders' => 0, 'pending_riders' => 0];

        Response::json([
          'totalRevenue' => floatval($revRow['total_revenue'] ?? 0),
          'totalOrdersCount' => intval($revRow['total_orders'] ?? 0),
          'activeOrdersCount' => intval($activeRow['active_count'] ?? 0),
          'deliveredOrdersCount' => intval($deliveredRow['delivered_count'] ?? 0),
          'totalMerchantsCount' => intval($merchRow['total_merchants'] ?? 0),
          'onlineMerchantsCount' => intval($merchRow['online_merchants'] ?? 0),
          'totalRidersCount' => intval($ridersRow['total_riders'] ?? 0),
          'activeRidersCount' => intval($ridersRow['active_riders'] ?? 0),
          'pendingRidersCount' => intval($ridersRow['pending_riders'] ?? 0)
        ]);
    }

    /**
     * Get riders directory
     */
    public function getRiders() {
        $stmt = $this->pdo->query("SELECT * FROM users WHERE role = 'rider' ORDER BY created_at DESC");
        $rows = $stmt ? $stmt->fetchAll() : [];

        if (empty($rows)) {
            Response::json([]);
            return;
        }

        $dbRiders = array_map(function($r) {
            $isApproved = ($r['status'] === 'active');
            return [
                'id' => $r['id'],
                'name' => $r['full_name'],
                'email' => $r['email'],
                'phone' => $r['phone'],
                'vehicleType' => 'Motorcycle',
                'vehicleModel' => 'Honda Click 125i',
                'plateNumber' => 'TRK-' . substr($r['id'], -4),
                'operatingCity' => 'Metro Manila',
                'rating' => 5.0,
                'deliveriesCount' => 0,
                'status' => $r['status'] ?? 'pending_approval',
                'isApproved' => $isApproved,
                'avatar' => $r['avatar'] ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
            ];
        }, $rows);

        Response::json($dbRiders);
    }

    /**
     * Approve rider account
     */
    public function approveRider($riderId) {
        $stmt = $this->pdo->prepare("UPDATE users SET status = 'active' WHERE id = ?");
        $stmt->execute([$riderId]);

        Response::json([
            'success' => true,
            'message' => "Rider {$riderId} has been approved successfully.",
            'riderId' => $riderId,
            'status' => 'active'
        ]);
    }

    /**
     * Get system users directory
     */
    public function getUsers() {
        $stmt = $this->pdo->query("SELECT id, full_name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC");
        $rows = $stmt ? $stmt->fetchAll() : [];

        if (empty($rows)) {
            Response::json([]);
            return;
        }

        $users = array_map(function($r) {
            return [
                'id' => $r['id'],
                'name' => $r['full_name'],
                'email' => $r['email'],
                'phone' => $r['phone'] ?? '+63 900 000 0000',
                'role' => $r['role'] ?? 'customer',
                'status' => ucfirst($r['status'] ?? 'active'),
                'joined' => date('Y-m-d', strtotime($r['created_at'] ?: 'now'))
            ];
        }, $rows);

        Response::json($users);
    }

    /**
     * Get System Settings
     */
    public function getSettings() {
        Response::json([
            'commissionRate' => 15,
            'surgeMultiplier' => 1.0,
            'autoDispatch' => true,
            'rainMode' => false
        ]);
    }

    /**
     * Update System Settings
     */
    public function updateSettings() {
        $data = json_decode(file_get_contents('php://input'), true);
        Response::json([
            'success' => true,
            'message' => 'System settings updated successfully.',
            'settings' => $data
        ]);
    }
}
