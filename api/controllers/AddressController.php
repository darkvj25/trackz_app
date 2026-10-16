<?php
// Trakz PHP Backend - Address Controller

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';

class AddressController {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    public function getAddresses() {
        $stmt = $this->pdo->query("SELECT * FROM addresses ORDER BY is_default DESC, created_at DESC");
        $rows = $stmt->fetchAll();

        $addresses = array_map(function($r) {
            return [
                'id' => $r['id'],
                'customerId' => $r['customer_id'],
                'label' => $r['label'],
                'street' => $r['street'],
                'barangay' => $r['barangay'],
                'city' => $r['city'],
                'postalCode' => $r['postal_code'],
                'deliveryInstructions' => $r['delivery_instructions'],
                'isDefault' => (bool)$r['is_default']
            ];
        }, $rows);

        Response::json($addresses);
    }

    public function addAddress() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['street']) || !isset($data['city'])) {
            Response::error('Street and City are required.');
        }

        $id = 'addr-' . time();
        $customerId = $data['customerId'] ?? 'cust-101';
        $label = $data['label'] ?? 'Home';
        $street = $data['street'];
        $barangay = $data['barangay'] ?? 'Barangay Central';
        $city = $data['city'];
        $postalCode = $data['postalCode'] ?? '1000';
        $instructions = $data['deliveryInstructions'] ?? '';
        $isDefault = isset($data['isDefault']) ? ($data['isDefault'] ? 1 : 0) : 0;

        $stmt = $this->pdo->prepare("INSERT INTO addresses (id, customer_id, label, street, barangay, city, postal_code, delivery_instructions, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $customerId, $label, $street, $barangay, $city, $postalCode, $instructions, $isDefault]);

        Response::json([
            'id' => $id,
            'customerId' => $customerId,
            'label' => $label,
            'street' => $street,
            'barangay' => $barangay,
            'city' => $city,
            'postalCode' => $postalCode,
            'deliveryInstructions' => $instructions,
            'isDefault' => (bool)$isDefault
        ], 201);
    }

    public function setDefaultAddress($id) {
        $this->pdo->exec("UPDATE addresses SET is_default = 0");
        $stmt = $this->pdo->prepare("UPDATE addresses SET is_default = 1 WHERE id = ?");
        $stmt->execute([$id]);

        return $this->getAddresses();
    }

    public function deleteAddress($id) {
        $stmt = $this->pdo->prepare("DELETE FROM addresses WHERE id = ?");
        $stmt->execute([$id]);

        Response::json(['success' => true]);
    }
}
