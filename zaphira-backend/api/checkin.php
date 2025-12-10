<?php
session_start();  // ✅ Enable PHP session

/************************************************************
 ✅ ENABLE DEBUGGING (Only for local)
 *************************************************************/
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

/************************************************************
 ✅ HELPER FUNCTIONS
 *************************************************************/
if (!function_exists('respondError')) {
    function respondError($message, $code = 400)
    {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message]);
        session_write_close(); // ✅ Ensure session saved before exit
        exit;
    }
}

if (!function_exists('isValidBase64')) {
    function isValidBase64($base64)
    {
        return (bool)preg_match('/^[A-Za-z0-9+\/=]+$/', $base64);
    }
}

if (!function_exists('saveBase64Image')) {
    function saveBase64Image($base64, $folder, $employee_id)
    {
        if (!is_dir($folder)) {
            mkdir($folder, 0777, true);
        }

        $fileName = "employee_{$employee_id}_" . date('Ymd_His') . ".jpg";
        $filePath = $folder . "/" . $fileName;

        $decoded = base64_decode($base64);
        if ($decoded === false) {
            return false;
        }

        if (file_put_contents($filePath, $decoded)) {
            return str_replace(__DIR__ . '/../', '', $filePath);
        }
        return false;
    }
}

/************************************************************
 ✅ CORS HEADERS (React + PHP Session Fix)
 *************************************************************/
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true"); // ✅ Required for session cookies

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    session_write_close();
    exit;
}

/************************************************************
 ✅ DATABASE CONNECTION
 *************************************************************/
require_once __DIR__ . '/../config/db.php';
date_default_timezone_set('Asia/Kolkata');

/************************************************************
 ✅ HANDLE JSON INPUT
 *************************************************************/
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['employee_id']) || empty($data['image_base64'])) {
    respondError('Missing required fields');
}

$employee_id = intval($data['employee_id']);
$image_base64 = trim($data['image_base64']);

if ($employee_id <= 0) {
    respondError('Invalid employee ID');
}

if (!isValidBase64($image_base64)) {
    respondError('Invalid image format');
}

/************************************************************
 ✅ CHECK FOR DUPLICATE CHECK-IN
 *************************************************************/
$today = date('Y-m-d');

try {
    $stmt = $pdo->prepare('SELECT id FROM attendance WHERE employee_id = ? AND DATE(date) = ?');
    $stmt->execute([$employee_id, $today]);

    if ($stmt->rowCount() > 0) {
        respondError('Already checked in today');
    }
} catch (PDOException $e) {
    respondError('Database error (check duplicate): ' . $e->getMessage());
}

/************************************************************
 ✅ SAVE IMAGE
 *************************************************************/
$uploadPath = __DIR__ . '/../uploads/checkin';
$checkin_image = saveBase64Image($image_base64, $uploadPath, $employee_id);

if (!$checkin_image) {
    respondError('Failed to save check-in image');
}

/************************************************************
 ✅ INSERT ATTENDANCE RECORD
 *************************************************************/
try {
    $stmt = $pdo->prepare(
        'INSERT INTO attendance (employee_id, checkin_time, checkin_image, date) 
         VALUES (?, NOW(), ?, ?)'
    );
    $stmt->execute([$employee_id, $checkin_image, $today]);

    // ✅ Optional: Set session variable to maintain login state
    $_SESSION['employee_id'] = $employee_id;
    $_SESSION['last_checkin'] = date('Y-m-d H:i:s');

    // ✅ Ensure session is saved before output
    session_write_close();

    echo json_encode([
        'success' => true,
        'message' => 'Check-in successful',
        'data' => [
            'id' => $pdo->lastInsertId(),
            'employee_id' => $employee_id,
            'checkin_time' => date('Y-m-d H:i:s'),
            'checkin_image' => $checkin_image
        ]
    ]);
} catch (PDOException $e) {
    respondError('Database insert failed: ' . $e->getMessage());
}
