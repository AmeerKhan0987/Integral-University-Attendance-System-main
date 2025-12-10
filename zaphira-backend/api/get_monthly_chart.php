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

// 🗓️ Get current month & year
$year = date('Y');
$month = date('m');

try {
    // 🧮 Total employees
    $totalEmpStmt = $pdo->query("SELECT COUNT(*) as total FROM employees");
    $totalEmp = $totalEmpStmt->fetchColumn();

    // 🧾 Get daily attendance count for the current month
    $stmt = $pdo->prepare("
        SELECT 
            DATE(a.date) AS day,
            COUNT(a.id) AS present
        FROM attendance a
        WHERE YEAR(a.date) = ? AND MONTH(a.date) = ?
        GROUP BY DATE(a.date)
        ORDER BY DATE(a.date)
    ");
    $stmt->execute([$year, $month]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 📅 Prepare full month data (fill missing days)
    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
    $data = [];

    for ($d = 1; $d <= $daysInMonth; $d++) {
        $dateStr = sprintf("%04d-%02d-%02d", $year, $month, $d);
        $found = array_filter($rows, fn($r) => $r['day'] === $dateStr);
        $present = $found ? array_values($found)[0]['present'] : 0;
        $absent = max(0, $totalEmp - $present);
        $data[] = [
            'name' => $d,
            'Present' => (int)$present,
            'Absent' => (int)$absent
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
