<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || empty($data['id'])) {
  echo json_encode(['success' => false, 'error' => 'Invalid request']);
  exit;
}

try {
  $stmt = $pdo->prepare("
    UPDATE employees 
    SET name = ?, email = ?
    WHERE id = ?
  ");
  $stmt->execute([
    $data['name'],
    $data['email'],
    $data['id']
  ]);

  echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
} catch (PDOException $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
