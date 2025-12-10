<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';
date_default_timezone_set('Asia/Kolkata');

function respondError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

try {
    $stmt = $pdo->query("
        SELECT 
            a.id, 
            a.employee_id,
            e.name AS employee_name, 
            a.date,
            a.checkin_time,
            a.checkout_time,
            a.checkin_image,
            a.checkout_image,
            CASE 
                WHEN a.checkin_time IS NULL THEN 'Absent'
                WHEN a.checkout_time IS NULL THEN 'Present (Not Checked Out)'
                ELSE 'Present'
            END AS status
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        ORDER BY a.date DESC, a.checkin_time DESC
    ");
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'count' => count($data), 'data' => $data]);
} catch (PDOException $e) {
    respondError('Database error: ' . $e->getMessage());
}
