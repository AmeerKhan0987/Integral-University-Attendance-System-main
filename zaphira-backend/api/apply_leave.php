<?php
// ✅ No spaces, no BOM, nothing before this line!

// ✅ Enable error reporting (dev mode only)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ✅ Universal CORS setup
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// ✅ Stop preflight OPTIONS request here
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'CORS preflight OK']);
    exit;
}

// ✅ Include database config
require_once '../config/db.php';

// ✅ Read JSON input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// ✅ Validate
if (
    empty($data['employee_id']) ||
    empty($data['date_from']) ||
    empty($data['date_to']) ||
    empty($data['reason'])
) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$employee_id = $data['employee_id'];
$date_from = $data['date_from'];
$date_to = $data['date_to'];
$reason = $data['reason'];

try {
    $stmt = $pdo->prepare("
        INSERT INTO leaves (employee_id, reason, date_from, date_to, status, created_at)
        VALUES (?, ?, ?, ?, 'Pending', NOW())
    ");
    $stmt->execute([$employee_id, $reason, $date_from, $date_to]);

    echo json_encode(['success' => true, 'message' => 'Leave application submitted successfully.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
