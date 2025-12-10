
<?php
// Set error reporting for development
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'zaphira_attendance2');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// PDO connection options
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8mb4'"
];

try {
    // Create PDO instance
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        $options
    );
} catch (PDOException $e) {
    // Log the error for server-side debugging
    error_log("Connection failed: " . $e->getMessage());
    if (ob_get_length()) ob_clean();
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed',
        'message' => $e->getMessage()
    ]);
    exit;
}

// Helper functions for API endpoints
function respondWithError($message, $code = 400) {
    header('Content-Type: application/json');
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

function validateBase64Image($base64) {
    if (empty($base64)) return false;
    $img = @base64_decode($base64);
    if (!$img) return false;
    $info = @getimagesizefromstring($img);
    if (!$info) return false;
    $mime = $info['mime'];
    if (!in_array($mime, ['image/jpeg', 'image/png'])) return false;
    return true;
}

function saveImage($base64, $directory, $prefix = '') {
    if (!is_dir($directory)) {
        mkdir($directory, 0777, true);
    }
    $img = base64_decode($base64);
    $f = finfo_open();
    $mime_type = finfo_buffer($f, $img, FILEINFO_MIME_TYPE);
    if (!in_array($mime_type, ['image/jpeg', 'image/png'])) {
        return false;
    }
    $ext = $mime_type === 'image/jpeg' ? 'jpg' : 'png';
    $filename = $prefix . '_' . date('Y-m-d') . '_' . uniqid() . '.' . $ext;
    $filepath = $directory . '/' . $filename;
    if (file_put_contents($filepath, $img)) {
        // Return relative path for frontend
        return str_replace($_SERVER['DOCUMENT_ROOT'], '', realpath($filepath));
    }
    return false;
}