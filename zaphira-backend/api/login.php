<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// OPTIONS (preflight) stop here
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/db.php';

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Read JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['email']) || !isset($data['password']) || !isset($data['role'])) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Missing required fields'
    ]);
    exit;
}

$email = strtolower(trim($data['email']));
$password = trim($data['password']);
$role = strtolower(trim($data['role']));

try {
    // ============================
    // ✅ ADMIN LOGIN
    // ============================
    if ($role === 'admin') {
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Demo admin (plain text)
        if ($email === "ceo123@gmail.com" && $password === "admin" && $user) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => 'admin',
                    'department' => 'Management',
                    'designation' => 'Administrator',
                    'profileImage' => $user['profile_image']
                        ? "http://localhost/zaphira-backend/{$user['profile_image']}"
                        : null,
                    'createdAt' => $user['created_at']
                ]
            ]);
            exit;
        }

        // Password hash verify
        if ($user && password_verify($password, $user['password'])) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => 'admin',
                    'department' => 'Management',
                    'designation' => 'Administrator',
                    'profileImage' => $user['profile_image']
                        ? "http://localhost/zaphira-backend/{$user['profile_image']}"
                        : null,
                    'createdAt' => $user['created_at']
                ]
            ]);
            exit;
        }
    }

    // ============================
    // ✅ EMPLOYEE LOGIN
    // ============================
    $stmt = $pdo->prepare("
        SELECT e.*, d.name as department_name 
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // Debug logs (for dev)
        error_log("====== LOGIN DEBUG ======");
        error_log("Email: " . $email);
        error_log("Password match (hash): " . (password_verify($password, $user['password']) ? "YES" : "NO"));

        // Plain or hashed password check
        if ($password === $user['password'] || password_verify($password, $user['password'])) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => 'employee',
                    'department' => $user['department_name'] ?? 'Unassigned',
                    'designation' => $user['designation'] ?? 'Employee',

                    // ✅ FIXED HERE (Removed pravatar)
                    'profileImage' => $user['profile_image']
                        ? "http://localhost/zaphira-backend/{$user['profile_image']}"
                        : null,

                    'faceData' => $user['face_data'],
                    'createdAt' => $user['created_at']
                ]
            ]);
            exit;
        }
    }

    // ❌ Invalid login
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid credentials'
    ]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
    exit;
}
?>
