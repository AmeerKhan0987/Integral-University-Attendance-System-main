<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    // ✅ Check if email already exists
    $stmt = $pdo->prepare('SELECT id FROM employees WHERE email = ?');
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already registered']);
        exit;
    }

    // ✅ Get 'Unassigned' department ID
    $stmt = $pdo->prepare('SELECT id FROM departments WHERE name = ?');
    $stmt->execute(['Unassigned']);
    $dept = $stmt->fetch();
    $deptId = $dept ? $dept['id'] : null;

    // ✅ Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    // ✅ Set default values
    $designation = 'New Hire';
    $profileImage = null; // 👈 important: set BEFORE insert

    // ✅ Insert new employee
    $stmt = $pdo->prepare("
        INSERT INTO employees (name, email, password, department_id, designation, profile_image) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $data['name'],
        $data['email'],
        $hashedPassword,
        $deptId,
        $designation,
        $profileImage
    ]);

    $userId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $userId,
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => 'employee',
            'department' => 'Unassigned',
            'designation' => $designation,
            'profileImage' => $profileImage,
            'createdAt' => date('Y-m-d H:i:s')
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
