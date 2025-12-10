import React, { useState } from "react";
import { User, Role } from "./types";
import AdminDashboard from "./components/admin/AdminDashboard";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import LoginScreen from "./components/LoginScreen";
import { DataProvider, useData } from "./context/DataContext";

const BG_IMAGE_URL = "/images/Hostel1.jpg";
const LOGO_URL = "/images/logo.jpeg";
const AppContent = () => {
  const { state } = useData();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = async (email: string, pass: string, role: Role) => {
    try {
      const response = await fetch(
        "http://localhost/zaphira-organic-farm-attendance-system-2/zaphira-backend/api/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLowerCase(),
            password: pass,
            role: role.toLowerCase(), // ✅ ROLE ADDED BACK
          }),
        }
      );

      const data = await response.json();
      console.log("RAW RESPONSE:", data);

      // ✅ backend may send data or user key
      const rawUser = data.data ?? data.user ?? null;

      if (data.success && rawUser) {
        const user: User = {
          ...rawUser,
          role:
            rawUser.role?.toLowerCase() === "admin"
              ? Role.Admin
              : Role.Employee,
          password: undefined, // ❌ don't store password
        };

        setCurrentUser(user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        logoUrl={LOGO_URL}
        backgroundUrl={BG_IMAGE_URL}
      />
    );
  }

  if (currentUser.role === Role.Admin) {
    return (
      <AdminDashboard
        user={currentUser}
        onLogout={handleLogout}
        logoUrl={LOGO_URL}
        backgroundUrl={BG_IMAGE_URL}
      />
    );
  } else {
    return (
      <EmployeeDashboard
        user={currentUser}
        onLogout={handleLogout}
        logoUrl={LOGO_URL}
        backgroundUrl={BG_IMAGE_URL}
      />
    );
  }
};

export default function App() {
  return (
    <DataProvider>
      <main className="font-sans bg-gray-50 min-h-screen">
        <AppContent />
      </main>
    </DataProvider>
  );
}
