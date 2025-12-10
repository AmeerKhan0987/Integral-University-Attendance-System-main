<?php
header('Content-Type: application/json');
require_once '../config/db.php';

try {
    // Get all employees
    $stmt = $pdo->query("SELECT id, name, email, password, department_id, designation FROM employees");
    $employees = $stmt->fetchAll();

    // Test password verification for each employee
    $results = [];
    foreach ($employees as $emp) {
        $results[] = [
            'id' => $emp['id'],
            'email' => $emp['email'],
            'password_length' => strlen($emp['password']),
            'is_hashed' => (strlen($emp['password']) > 20), // Simple check if it looks like a hash
            'test_verify' => password_verify('password', $emp['password']) // Test with common password
        ];
    }

    echo json_encode([
        'success' => true,
        'message' => 'Employee password verification test',
        'results' => $results
    ], JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>