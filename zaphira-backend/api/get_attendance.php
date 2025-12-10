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

function respondError($msg, $code = 400)
{
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

$employee_id = filter_var($_GET['employee_id'] ?? null, FILTER_VALIDATE_INT);
if (!$employee_id) {
    respondError('Invalid or missing employee ID');
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.employee_id,
            DATE(a.date) AS date,
            TIME(a.checkin_time) AS checkin_time,
            TIME(a.checkout_time) AS checkout_time,
            a.checkin_image,
            a.checkout_image,
            e.name AS employee_name,
            -- ✅ Add worked hours calculation
            CASE 
                WHEN a.checkout_time IS NOT NULL 
                THEN CONCAT(
                    FLOOR(TIME_TO_SEC(TIMEDIFF(a.checkout_time, a.checkin_time)) / 3600), 'h ',
                    FLOOR((TIME_TO_SEC(TIMEDIFF(a.checkout_time, a.checkin_time)) % 3600) / 60), 'm'
                )
                ELSE NULL
            END AS worked_hours
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.employee_id = ?
        ORDER BY a.date DESC, a.checkin_time DESC
    ");
    $stmt->execute([$employee_id]);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($records)) {
        echo json_encode(['success' => true, 'message' => 'No records found', 'data' => []]);
    } else {
        echo json_encode(['success' => true, 'data' => $records]);
    }
} catch (PDOException $e) {
    respondError('Database query failed: ' . $e->getMessage());
}

