<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';
date_default_timezone_set('Asia/Kolkata');

$today = date('Y-m-d');

try {
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.employee_id,
            e.name AS employee_name,
            a.checkin_time,
            a.checkout_time,
            a.checkin_image,
            a.checkout_image
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE DATE(a.date) = ?
        ORDER BY a.checkin_time ASC
    ");
    $stmt->execute([$today]);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $records
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
