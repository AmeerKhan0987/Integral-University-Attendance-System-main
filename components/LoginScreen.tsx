import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { User, Role } from "../types";
import { api } from "../services/api";

interface LoginScreenProps {
  onLogin: (email: string, pass: string, role: Role) => Promise<boolean>;
  logoUrl: string;
  backgroundUrl: string;
}

const commonInputClasses =
  "appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm";
const commonButtonClasses =
  "group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors";

function SignUpForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const { state, dispatch } = useData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        "http://localhost/zaphira-backend/api/register.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email: email.toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Sign up successful! Please return to log in.");
        setName("");
        setEmail("");
        setPassword("");
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("Registration failed. Please try again later.");
    }
  };

  return (
    <>
      <h2 className="text-3xl font-extrabold text-center text-gray-900">
        Create Account
      </h2>
      <p className="text-center text-gray-600 mt-2">Join the Integral team</p>
      <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
        <div className="rounded-md shadow-sm -space-y-px">
          <input
            name="name"
            type="text"
            required
            className={`${commonInputClasses} rounded-t-md`}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`${commonInputClasses}`}
            placeholder="Organization Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={`${commonInputClasses} rounded-b-md`}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {successMessage && (
          <p className="text-sm text-green-600 text-center">{successMessage}</p>
        )}

        <div>
          <button type="submit" className={commonButtonClasses}>
            Sign up
          </button>
        </div>
      </form>
      <div className="text-sm text-center mt-4">
        <a
          href="#"
          onClick={onBackToLogin}
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Already have an account? Sign in
        </a>
      </div>
    </>
  );
}

function LoginForm({
  onLogin,
  onGoToSignUp,
}: {
  onLogin: LoginScreenProps["onLogin"];
  onGoToSignUp: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>(Role.Employee);

  const autofillAdmin = async () => {
    const adminEmail = "ceo123@gmail.com";
    const adminPass = "admin";
    setSelectedRole(Role.Admin);
    setEmail(adminEmail);
    setPassword(adminPass);
    try {
      const ok = await onLogin(adminEmail, adminPass, Role.Admin);
      if (!ok) setError("Admin sign-in failed. Check credentials.");
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Admin login error:", err);
    }
  };

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError("");
  //   try {
  //     const response = await api.post("/login.php", {
  //       email: email.toLowerCase(),
  //       password,
  //       role: selectedRole === Role.Admin ? "admin" : "employee",
  //     });

  //     if (response.data.success) {
  //       const userData = response.data.data;
  //       // Check if user role matches selected role
  //       if (
  //         userData.role !== (selectedRole === Role.Admin ? "admin" : "employee")
  //       ) {
  //         setError(`This account is not registered as ${selectedRole}`);
  //         return;
  //       }
  //       // ✅ Redirect to role dashboard
  //       if (userData.role === "employee") {
  //         window.location.href = "/employee";
  //       } else {
  //         window.location.href = "/admin";
  //       }

  //       const success = await onLogin(email, password, selectedRole);
  //       if (!success) {
  //         setError("Login failed. Please try again.");
  //       }
  //     } else {
  //       setError(response.data.error || "Invalid credentials");
  //     }
  //   } catch (err) {
  //     setError("Login failed. Please try again.");
  //     console.error("Login error:", err);
  //   }
  // };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/login.php", {
        email: email.toLowerCase(),
        password,
        role: selectedRole === Role.Admin ? "admin" : "employee",
      });

      if (response.data.success) {
        const userData = response.data.data;

        // ✅ Validate selected role matches DB role
        if (
          userData.role !== (selectedRole === Role.Admin ? "admin" : "employee")
        ) {
          setError(`This account is not registered as ${selectedRole}`);
          return;
        }

        // ✅ First update auth context
        const success = await onLogin(email, password, selectedRole);
        if (!success) {
          setError("Login failed. Please try again.");
          return;
        }

        // ✅ After successful context update → redirect
        // if (userData.role === "employee") {
        //   window.location.href = "/employee";
        // } else {
        //   window.location.href = "/admin";
        // }
      } else {
        setError(response.data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Login failed. Please SignUp.");
      console.error("Login error:", err);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-extrabold text-center text-gray-900">
        Integral University
      </h2>

      <div className="flex justify-center my-4 border border-gray-300 rounded-lg p-1 bg-gray-100">
        <button
          onClick={() => setSelectedRole(Role.Employee)}
          className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            selectedRole === Role.Employee
              ? "bg-primary-600 text-white shadow"
              : "text-gray-600 hover:bg-primary-50"
          }`}
        >
          Employee Sign-In
        </button>
        <button
          onClick={() => setSelectedRole(Role.Admin)}
          className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            selectedRole === Role.Admin
              ? "bg-primary-600 text-white shadow"
              : "text-gray-600 hover:bg-primary-50"
          }`}
        >
          Admin Sign-In
        </button>
      </div>

      <p className="text-center text-gray-600 mt-2">Sign in to your account</p>
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="rounded-md shadow-sm -space-y-px">
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`${commonInputClasses} rounded-t-md`}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`${commonInputClasses} rounded-b-md`}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div className="text-sm text-center">
          <a
            href="#"
            onClick={() =>
              alert("Please contact an admin to reset your password.")
            }
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </a>
        </div>

        {/* Quick-fill admin demo button for testing
        <div className="mt-4">
          <button
            type="button"
            onClick={autofillAdmin}
            className="w-full py-2 px-3 border rounded-md text-sm bg-yellow-400 text-black hover:opacity-90"
          >
            Use Admin (demo)
          </button>
        </div> */}

        <div>
          <button type="submit" className={commonButtonClasses}>
            Sign in as {selectedRole === Role.Admin ? "Admin" : "Employee"}
          </button>
        </div>
      </form>
      <div className="text-sm text-center mt-4">
        <a
          href="#"
          onClick={onGoToSignUp}
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Don't have an account? Sign up
        </a>
      </div>
    </>
  );
}

export default function LoginScreen({
  onLogin,
  logoUrl,
  backgroundUrl,
}: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-gray-100"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl">
        <div className="flex flex-col items-center">
          <img
            src={logoUrl}
            alt="App Logo"
            className="w-24 h-24 mb-4 rounded-full shadow-lg"
          />
        </div>
        {isSignUp ? (
          <SignUpForm onBackToLogin={() => setIsSignUp(false)} />
        ) : (
          <LoginForm onLogin={onLogin} onGoToSignUp={() => setIsSignUp(true)} />
        )}
      </div>
    </div>
  );
}
