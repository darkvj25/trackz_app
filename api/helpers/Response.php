<?php
// Trakz PHP Backend - JSON Response & CORS Helper

class Response {
    public static function enableCORS() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

        header("Access-Control-Allow-Origin: {$origin}");
        if ($origin !== '*') {
            header('Access-Control-Allow-Credentials: true');
        }
        header('Access-Control-Max-Age: 86400');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit(0);
        }
    }

    public static function json($data, $statusCode = 200) {
        self::enableCORS();
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        exit();
    }

    public static function error($message, $statusCode = 400, $data = null) {
        self::json([
            'success' => false,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }
}
