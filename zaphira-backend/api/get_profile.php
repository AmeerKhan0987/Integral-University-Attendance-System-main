<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config/db.php';

$employee_id = $_GET['employee_id'] ?? null;
if (!$employee_id) {
  echo json_encode(['success' => false, 'error' => 'Missing employee ID']);
  exit;
}

try {
  $stmt = $pdo->prepare("
    SELECT 
      id, 
      name, 
      email, 
      profile_image 
    FROM employees 
    WHERE id = ?
  ");
  $stmt->execute([$employee_id]);
  $profile = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($profile) {
    echo json_encode(['success' => true, 'data' => $profile]);
  } else {
    echo json_encode(['success' => false, 'error' => 'Profile not found']);
  }
} catch (PDOException $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
