<?php
// Trakz PHP Backend - Lightweight JWT Authentication Helper

class JWT {
    private static $secretKey = 'trakz_secret_jwt_key_2025_safe';

    public static function generateToken($userId, $email) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'sub' => $userId,
            'email' => $email,
            'iat' => time(),
            'exp' => time() + (86400 * 30) // 30 days
        ]);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secretKey, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function verifyToken($jwt) {
        if (!$jwt) return null;

        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) return null;

        $header = self::base64UrlDecode($tokenParts[0]);
        $payload = self::base64UrlDecode($tokenParts[1]);
        $signatureProvided = $tokenParts[2];

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secretKey, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        if ($base64UrlSignature === $signatureProvided) {
            $data = json_decode($payload, true);
            if (isset($data['exp']) && $data['exp'] < time()) {
                return null;
            }
            return $data;
        }

        return null;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
