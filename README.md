# Integral University Attendance System

## Setup Instructions

### 1. Database Setup

1. Start your MySQL server (via WAMP, XAMPP, etc.)
2. Open phpMyAdmin or your MySQL client
3. Import the database schema from `zaphira backend/database.sql`

### 2. Backend Setup

1. Ensure WAMP/XAMPP is running
2. Copy the entire project folder to your www directory (e.g., c:/wamp64/www/)
3. The backend API will be available at: http://localhost/zaphira-backend/api/

### 3. Frontend Setup

1. Install Node.js if you haven't already
2. Open a terminal in the project root
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000 in your browser

## Default Credentials

### Admin Login

- Email: ceo123@gmail.com
- Password: admin

### Demo Employee

- Email: employee.demo@example.com
- Password: password

The demo employee account will be created automatically when you click the "Use Employee (demo)" button on the login screen.

## Features

- Admin & Employee Login
- Attendance Tracking
- Leave Management
- Department Management
- Face Recognition (placeholder)
- Real-time Notifications

## API Endpoints

- POST /api/login.php - Login for both admin and employees
- POST /api/register.php - Register new employees
- More endpoints coming soon...

## Development

- Backend: PHP with MySQL
- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS
  return $this->conn;
  }
  }
  ?>
  ```

4.  **Create API Endpoints:**

    - **User Signup (`api/auth/signup.php`):**
      - Receive `name`, `email`, and `password` via a `POST` request.
      - **Hash the password** using PHP's built-in `password_hash()` function. **NEVER store plain text passwords.**
      - Insert the new user into the `users` table using a **prepared statement** to prevent SQL injection.
    - **User Signin (`api/auth/signin.php`):**
      - Receive `email` and `password`.
      - Fetch the user from the database by email.
      - Verify the password using `password_verify($plain_password, $hashed_password_from_db)`.
      - If successful, generate a JSON Web Token (JWT). Use a library like `firebase/php-jwt` (installable via Composer: `composer require firebase/php-jwt`).
      - Return the JWT to the frontend.

5.  **Authentication Middleware (`middleware/auth.php`):**
    - Create a function that checks for the `Authorization` header.
    - It should extract the JWT, decode it using your secret key, and verify it's valid.
    - On your protected API endpoints (like getting user data), you will call this function first. If the token is invalid, you return a `401 Unauthorized` error.

---

## 4. Completing and Adding Features

Here is how to implement the application's core and future functionalities using PHP.

#### **A. Employee Face Recognition (Advanced)**

1.  **Face Registration (Admin):**

    - **Frontend (`FaceScanModal.tsx`):** Capture a clear image and convert it to a Base64 string.
    - **Backend (`api/users/register-face.php`):** This PHP script receives the user's ID and the Base64 image.
    - Use **cURL** in PHP to send the image data to a third-party service like **AWS Rekognition** or **Azure Face API**.
    - The service will return a unique "Face ID".
    - Store this Face ID in your `users` table for that employee.

2.  **Face Verification (Employee Check-In):**
    - **Frontend (`AttendanceMarker.tsx`):** Capture a new image when the employee checks in.
    - **Backend (`api/attendance/verify-face.php`):** This script receives the new image.
    - Use cURL again to send this new image to the face recognition service, asking it to compare it against the stored Face ID.
    - If the service confirms a match, the PHP script proceeds to log the attendance in the `attendance` table.

#### **B. Employee Profile Management ("My Profile")**

- Create endpoints like `api/users/profile.php`.
- A `GET` request (with a valid JWT) will fetch the logged-in user's data.
- A `PUT` or `POST` request can be used to update their information.
- For password changes, create a separate, secure endpoint that requires the user's current password for verification before updating.

#### **C. Password Reset ("Forgot your password?")**

1.  **Backend (`api/auth/forgot-password.php`):**

    - Takes the user's email.
    - Generates a secure, random token and saves its hash in the `password_resets` table with an expiration time.
    - Use a PHP email library like **PHPMailer** (installable via Composer) to send a password reset link to the user's email.

2.  **Backend (`api/auth/reset-password.php`):**
    - This endpoint receives the token from the URL and the new password from the form.
    - It verifies the token is valid and not expired, then updates the user's password in the `users` table (with `password_hash()`).

---

## 5. Security Best Practices (PHP & MySQL)

- **SQL Injection:** **ALWAYS** use **Prepared Statements** with PDO or MySQLi. Never concatenate user input directly into your SQL queries.
- **Password Hashing:** Use `password_hash()` and `password_verify()`. Do not use older, insecure methods like MD5 or SHA1.
- **Cross-Site Scripting (XSS):** Sanitize all user output that is displayed on a page using `htmlspecialchars()`.
- **Sensitive Information:** Do not store database credentials in your public PHP files. Keep them in a separate config file outside of the public web root if possible.
- **CORS:** At the top of your PHP API files, set the correct Cross-Origin Resource Sharing headers to only allow requests from your frontend's domain.
  ```php
  header("Access-Control-Allow-Origin: https://your-frontend-app.com");
  header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
  ```
- **Error Reporting:** In a production environment, turn off detailed error reporting to avoid exposing server information. `error_reporting(0); ini_set('display_errors', 0);`

---

## 6. Deployment Guide

1.  **Backend (Shared Hosting or VPS):**

    - Most web hosts (like **Hostinger**, **Bluehost**, **SiteGround**) offer affordable shared hosting with PHP and MySQL support.
    - You can upload your `zaphira-backend` files using an **FTP client** (like FileZilla) or via a cPanel File Manager.
    - Use the hosting provider's tools (usually phpMyAdmin) to create your database and import your table structures. Update your `database.php` file with the production database credentials.

2.  **Frontend (e.g., Vercel, Netlify):**

    - These platforms are perfect for hosting your React frontend.
    - Connect your Git repository. They will build and deploy your app automatically.
    - You will need to set an environment variable in the Vercel/Netlify dashboard to point to your live backend API URL (e.g., `https://api.yourdomain.com`).

3.  **Database:**
    - Your hosting provider will give you the credentials for your MySQL database. Ensure you use a strong password. Many hosts also provide tools to back up your database regularly, which is highly recommended.
