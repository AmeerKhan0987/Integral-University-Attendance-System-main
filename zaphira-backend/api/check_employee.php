<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$email = 'tum2123@gmail.com'; // The email that's failing to login

try {
    // Check if employee exists
    $stmt = $pdo->prepare('
        SELECT e.*, d.name as department_name 
        FROM employees e 
        LEFT JOIN departments d ON e.department_id = d.id 
        WHERE e.email = ?
    ');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode([
            'success' => true,
            'message' => 'Employee found',
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'password_hash_length' => strlen($user['password']),
                'department' => $user['department_name'] ?? 'Unassigned'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Employee not found'
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>