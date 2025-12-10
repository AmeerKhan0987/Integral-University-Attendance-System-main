<?php
// ✅ Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// ✅ CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ DB connection
require_once __DIR__ . '/../config/db.php';
date_default_timezone_set('Asia/Kolkata');

// ✅ Helper for error response
function respondError($message, $code = 400)
{
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

// ✅ Get JSON body
$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['employee_id']) || empty($data['image_base64'])) {
    respondError('Missing required fields');
}

$employee_id = intval($data['employee_id']);
$image_base64 = trim($data['image_base64']);
$today = date('Y-m-d');

if ($employee_id <= 0) {
    respondError('Invalid employee ID');
}

// ✅ Validate image format
if (!preg_match('/^[A-Za-z0-9+\/=]+$/', $image_base64)) {
    respondError('Invalid image format');
}

// ✅ Fetch today’s record — main fix here 🔽
try {
    $stmt = $pdo->prepare("
        SELECT id, checkout_time 
        FROM attendance 
        WHERE employee_id = ? 
        AND (DATE(date) = ? OR date = ?) 
        LIMIT 1
    ");
    $stmt->execute([$employee_id, $today, $today]);
    $record = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$record) {
        respondError('No check-in record found for today');
    }

    if (!empty($record['checkout_time'])) {
        respondError('Already checked out today');
    }
} catch (PDOException $e) {
    respondError('Database query failed: ' . $e->getMessage());
}

// ✅ Save checkout image
$folder = __DIR__ . '/../uploads/checkout';
if (!is_dir($folder)) mkdir($folder, 0777, true);

$filename = "employee_{$employee_id}_" . date('Ymd_His') . ".jpg";
$filePath = $folder . '/' . $filename;

$decoded = base64_decode($image_base64);
if ($decoded === false || !file_put_contents($filePath, $decoded)) {
    respondError('Failed to save checkout image');
}

$relativePath = "uploads/checkout/" . $filename;

// ✅ Update checkout info
try {
    $stmt = $pdo->prepare('UPDATE attendance SET checkout_time = NOW(), checkout_image = ? WHERE id = ?');
    $stmt->execute([$relativePath, $record['id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Check-out successful',
        'data' => [
            'employee_id' => $employee_id,
            'checkout_time' => date('Y-m-d H:i:s'),
            'checkout_image' => $relativePath
        ]
    ]);
} catch (PDOException $e) {
    respondError('Database update failed: ' . $e->getMessage());
}
