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

if (!isset($_POST['employee_id'])) {
  echo json_encode(['success' => false, 'error' => 'Employee ID missing']);
  exit;
}

$employee_id = intval($_POST['employee_id']);

if (!isset($_FILES['profile_image'])) {
  echo json_encode(['success' => false, 'error' => 'No image uploaded']);
  exit;
}

$uploadDir = __DIR__ . '/../uploads/profile/';
if (!file_exists($uploadDir)) {
  mkdir($uploadDir, 0777, true);
}

$ext = pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION);
$filename = 'employee_' . $employee_id . '_' . time() . '.' . $ext;
$uploadPath = $uploadDir . $filename;
$imageUrl = 'uploads/profile/' . $filename;

if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $uploadPath)) {
  $stmt = $pdo->prepare("UPDATE employees SET profile_image = ? WHERE id = ?");
  $stmt->execute([$imageUrl, $employee_id]);

  echo json_encode(['success' => true, 'message' => 'Profile image updated', 'image_url' => $imageUrl]);
} else {
  echo json_encode(['success' => false, 'error' => 'Failed to upload image']);
}
