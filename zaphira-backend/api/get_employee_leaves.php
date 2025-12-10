<?php
// ✅ Enable debugging during development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ✅ CORS HEADERS — allow React app to access this file
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// ✅ Handle OPTIONS request (browser preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

// ✅ Validate input
$employee_id = $_GET['employee_id'] ?? null;

if (!$employee_id) {
    echo json_encode(['success' => false, 'error' => 'Missing employee ID']);
    exit;
}

try {
    // ✅ Fetch employee’s leave records
    $stmt = $pdo->prepare("
        SELECT l.*, e.name AS employee_name
        FROM leaves l
        LEFT JOIN employees e ON e.id = l.employee_id
        WHERE l.employee_id = ?
        ORDER BY l.id DESC
    ");
    $stmt->execute([$employee_id]);
    $leaves = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $leaves
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
