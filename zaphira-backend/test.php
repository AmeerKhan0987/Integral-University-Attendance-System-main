<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config/db.php';

try {
    // Test admin table
    $stmt = $pdo->query("SELECT * FROM admins WHERE email = 'ceo123@gmail.com'");
    $admin = $stmt->fetch();
    echo "Admin test:\n";
    var_dump($admin);

    // Test departments table
    $stmt = $pdo->query("SELECT * FROM departments");
    $departments = $stmt->fetchAll();
    echo "\nDepartments test:\n";
    var_dump($departments);

    // Test creating a demo employee
    $stmt = $pdo->prepare("
        INSERT INTO employees (name, email, password, department_id, designation)
        SELECT 'Demo Employee', 'employee.demo@example.com', ?, id, 'Demo'
        FROM departments WHERE name = 'Unassigned'
        ON DUPLICATE KEY UPDATE id = id
    ");
    $hashedPassword = password_hash('password', PASSWORD_DEFAULT);
    $stmt->execute([$hashedPassword]);
    
    // Test reading the employee
    $stmt = $pdo->query("SELECT * FROM employees WHERE email = 'employee.demo@example.com'");
    $employee = $stmt->fetch();
    echo "\nEmployee test:\n";
    var_dump($employee);

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>