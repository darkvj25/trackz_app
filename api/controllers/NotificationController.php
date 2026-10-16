<?php
// Trakz PHP Backend - Notification Controller

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';

class NotificationController {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    public function getNotifications() {
        $stmt = $this->pdo->query("SELECT * FROM notifications ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();

        $notifications = array_map(function($r) {
            return [
                'id' => $r['id'],
                'title' => $r['title'],
                'message' => $r['message'],
                'type' => $r['type'],
                'isRead' => (bool)$r['is_read'],
                'timestamp' => $r['created_at']
            ];
        }, $rows);

        Response::json($notifications);
    }

    public function markAsRead($id) {
        $stmt = $this->pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
        $stmt->execute([$id]);

        return $this->getNotifications();
    }

    public function markAllAsRead() {
        $this->pdo->exec("UPDATE notifications SET is_read = 1");

        return $this->getNotifications();
    }
}
