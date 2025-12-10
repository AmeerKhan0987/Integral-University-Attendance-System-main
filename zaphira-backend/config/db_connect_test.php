<?php
// Set headers for CORS and JSON response
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Define secure access constant
define('SECURE_ACCESS', true);

// Include database connection
require_once 'db_conn.php';

try {
    // Simple test query
    $stmt = $pdo->prepare('SELECT id, name, email, created_at FROM admins LIMIT 1');
    $stmt->execute();
    $result = $stmt->fetch();

    if ($result) {
        echo json_encode([
            'success' => true,
            'data' => $result,
            'message' => 'Database connection and query successful'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'data' => null,
            'message' => 'No admin records found'
        ]);
    }

} catch (PDOException $e) {
    // Log the error server-side
    error_log("Query failed: " . $e->getMessage());
    
    // Clear any output that might have been sent
    if (ob_get_length()) ob_clean();
    
    // Send error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database query failed',
        'message' => $e->getMessage()
    ]);
}
?>