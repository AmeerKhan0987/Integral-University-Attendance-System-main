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
    // ✅ Total employees
    $totalEmployees = $pdo->query("SELECT COUNT(*) FROM employees")->fetchColumn();

    // ✅ Present today (those who checked in)
    $presentToday = $pdo->query("SELECT COUNT(*) FROM attendance WHERE date = '$today'")->fetchColumn();

    // ✅ Absent = total - present
    $absentToday = max(0, $totalEmployees - $presentToday);

    // ✅ Leave check (safe fallback)
    $onLeave = 0;
    try {
        // Only run if columns exist
        $stmt = $pdo->query("SHOW COLUMNS FROM leaves LIKE 'start_date'");
        if ($stmt->rowCount() > 0) {
            $onLeave = $pdo->query("SELECT COUNT(*) FROM leaves WHERE '$today' BETWEEN start_date AND end_date")->fetchColumn();
        }
    } catch (Exception $e) {
        $onLeave = 0;
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'totalEmployees' => (int)$totalEmployees,
            'presentToday' => (int)$presentToday,
            'absentToday' => (int)$absentToday,
            'onLeave' => (int)$onLeave
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
